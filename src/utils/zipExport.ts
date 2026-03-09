/**
 * zipExport — ZIP v2.0 Export
 * GN370 V2.0 · STEP 20 (export.js) · VH-09
 *
 * VH-09: filename = AAAAGGMMHHMM.zip (12 cifre, nessun separatore)
 * Invariante I6: /^\d{12}\.zip$/
 * Invariante I7: roundtrip lossless (stessa struttura importabile)
 *
 * Struttura ZIP:
 *   META.table
 *   CHECKSUM.sha256  (semplificato: lista file + byte count)
 *   tables/
 *     PERSON.table  FAMILY.table  FAMILY_LINK.table  EVENT.table
 *     PLACE.table   SOURCE.table  CITATION.table     TITLE.table
 *     TITLE_ASSIGNMENT.table  HOUSE.table  PERSON_HOUSE.table
 *     HERALDRY.table  RELATION.table  JOURNAL.table
 *   originals/       (VH-08)
 *   heraldry/        (SVG standalone)
 */

import JSZip from 'jszip';
import { journalAppend } from './journalManager';

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export interface ExportPayload {
  persons: Record<string, unknown>;
  families?: Record<string, unknown>;
  heraldry?: Record<string, unknown>;
  originalGedcom?: string;          // contenuto .ged originale (VH-08)
  originalGedcomFilename?: string;
  svgFiles?: Array<{ filename: string; content: string }>;
  schemaVersion?: string;
}

// ─── Helper: genera filename VH-09 ───────────────────────────────────────────

/**
 * Genera AAAAGGMMHHMM.zip
 * @example "202603101430.zip"
 */
export function generateZipFilename(now = new Date()): string {
  const y = String(now.getFullYear());
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const name = `${y}${mo}${d}${h}${min}.zip`;

  // Invariante I6
  if (!/^\d{12}\.zip$/.test(name)) {
    throw new Error(`GN370 I6 VIOLATION: ZIP filename "${name}" does not match /^\\d{12}\\.zip$/`);
  }
  return name;
}

// ─── Helper: NDJSON per tabella ───────────────────────────────────────────────

function toNdjson(tableName: string, records: unknown[], schemaVersion = '2.0'): string {
  const header = {
    '##TABLE': tableName,
    '|SCHEMA': schemaVersion,
    '|CREATED': new Date().toISOString(),
    '|COUNT': records.length,
  };
  const lines = [JSON.stringify(header), ...records.map(r => JSON.stringify(r))];
  return lines.join('\n') + '\n';
}

// ─── Helper: checksum semplificato ───────────────────────────────────────────

function buildChecksum(files: Record<string, string>): string {
  const lines = Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, content]) => `${content.length.toString(16).padStart(8, '0')}  ${path}`);
  return lines.join('\n') + '\n';
}

// ─── Funzione principale ──────────────────────────────────────────────────────

export async function buildAndDownloadZip(payload: ExportPayload): Promise<string> {
  const {
    persons,
    families = {},
    heraldry = {},
    originalGedcom,
    originalGedcomFilename = 'dataset.ged',
    svgFiles = [],
    schemaVersion = '2.0',
  } = payload;

  const zip = new JSZip();
  const allFiles: Record<string, string> = {};

  // ── META.table ──────────────────────────────────────────────────────────────
  const meta = {
    meta_id: `GNM-${Date.now()}`,
    schema_version: schemaVersion,
    dataset_name: 'GN370-GIARDINA-NEGRINI',
    created_at: new Date().toISOString(),
    env: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'DEV' : 'PROD',
    person_count: Object.keys(persons).length,
    family_count: Object.keys(families).length,
  };
  const metaContent = toNdjson('META', [meta], schemaVersion);
  allFiles['META.table'] = metaContent;
  zip.file('META.table', metaContent);

  // ── tables/ ─────────────────────────────────────────────────────────────────
  const tablesFolder = zip.folder('tables')!;

  const personRecords = Object.values(persons);
  const personContent = toNdjson('PERSON', personRecords, schemaVersion);
  allFiles['tables/PERSON.table'] = personContent;
  tablesFolder.file('PERSON.table', personContent);

  const familyRecords = Object.values(families);
  const familyContent = toNdjson('FAMILY', familyRecords, schemaVersion);
  allFiles['tables/FAMILY.table'] = familyContent;
  tablesFolder.file('FAMILY.table', familyContent);

  // Family links (figlio → famiglia)
  const familyLinks: unknown[] = [];
  for (const [famId, fam] of Object.entries(families)) {
    const f = fam as Record<string, unknown>;
    const chil = (f.chil as string[]) ?? [];
    for (const childId of chil) {
      familyLinks.push({ family_id: famId, person_id: childId, role: 'CHILD' });
    }
    if (f.husb) familyLinks.push({ family_id: famId, person_id: f.husb, role: 'HUSBAND' });
    if (f.wife) familyLinks.push({ family_id: famId, person_id: f.wife, role: 'WIFE' });
  }
  const flContent = toNdjson('FAMILY_LINK', familyLinks, schemaVersion);
  allFiles['tables/FAMILY_LINK.table'] = flContent;
  tablesFolder.file('FAMILY_LINK.table', flContent);

  // Tabelle vuote (struttura per roundtrip I7)
  const emptyTables = [
    'EVENT', 'PERSON_EVENT', 'PLACE', 'SOURCE', 'CITATION',
    'TITLE', 'TITLE_ASSIGNMENT', 'HOUSE', 'PERSON_HOUSE', 'RELATION',
  ];
  for (const t of emptyTables) {
    const c = toNdjson(t, [], schemaVersion);
    allFiles[`tables/${t}.table`] = c;
    tablesFolder.file(`${t}.table`, c);
  }

  // HERALDRY
  const heraldryRecords = Object.values(heraldry);
  const heraldryContent = toNdjson('HERALDRY', heraldryRecords, schemaVersion);
  allFiles['tables/HERALDRY.table'] = heraldryContent;
  tablesFolder.file('HERALDRY.table', heraldryContent);

  // JOURNAL (append-only snapshot)
  const { journalRead } = await import('./journalManager');
  const journalRecords = journalRead();
  const journalContent = toNdjson('JOURNAL', journalRecords, schemaVersion);
  allFiles['tables/JOURNAL.table'] = journalContent;
  tablesFolder.file('JOURNAL.table', journalContent);

  // ── originals/ (VH-08) ─────────────────────────────────────────────────────
  if (originalGedcom) {
    const originalsFolder = zip.folder('originals')!;
    allFiles[`originals/${originalGedcomFilename}`] = originalGedcom;
    originalsFolder.file(originalGedcomFilename, originalGedcom);
  }

  // ── heraldry/ (SVG standalone) ─────────────────────────────────────────────
  if (svgFiles.length > 0) {
    const heraldryFolder = zip.folder('heraldry')!;
    for (const svg of svgFiles) {
      allFiles[`heraldry/${svg.filename}`] = svg.content;
      heraldryFolder.file(svg.filename, svg.content);
    }
  }

  // ── CHECKSUM.sha256 (semplificato) ────────────────────────────────────────
  const checksumContent = buildChecksum(allFiles);
  zip.file('CHECKSUM.sha256', checksumContent);

  // ── Genera file e scarica ──────────────────────────────────────────────────
  const filename = generateZipFilename();
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Journal entry
  journalAppend('EXPORT', `ZIP export: ${filename} · ${personRecords.length} persone`, {
    entity_type: 'ZIP',
    entity_count: personRecords.length,
  });

  return filename;
}
