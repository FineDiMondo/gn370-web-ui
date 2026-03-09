/**
 * gedcomParser — GEDCOM 5.5.1 / 7.0 client-side parser
 * GN370 V2.0 · STEP 11
 *
 * Invariante I8:  INDI count GEDCOM = PERSON count DB dopo import
 * Invariante I9:  ABT 1500 → qual='A'  (e tutti gli altri qualificatori)
 * Invariante I17: file .ged originale conservato in originals/
 *
 * Qualificatori data (GNP-BD-*):
 *   ABT → qual='A'  (About)
 *   BEF → qual='B'  (Before)
 *   AFT → qual='R'  (After)
 *   BET → qual='T'  (Between)
 *   CAL → qual='C'  (Calculated)
 *   EST → qual='S'  (Estimated)
 *   (none) → qual='E' (Exact)
 *
 * Calendari:
 *   @#DJULIAN@   → cal='J'
 *   @#DHEBREW@   → cal='H'
 *   @#DFRENCH R@ → cal='F'
 *   (none / @#DGREGORIAN@) → cal='G'
 */

import type { WorldMetadata } from '../data/mockData';

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export type DateQual = 'E' | 'A' | 'B' | 'R' | 'T' | 'C' | 'S';
export type DateCal  = 'G' | 'J' | 'H' | 'F';

export interface GedcomDate {
  raw: string;
  year: number | null;
  year2: number | null;   // solo per BET…AND
  qual: DateQual;
  cal: DateCal;
}

export interface GedcomPerson {
  id: string;
  gedcom_xref: string;
  name: string;
  surname: string;
  given_name: string;
  gender: 'M' | 'F' | 'U';
  birth_date: GedcomDate | null;
  birth_place: string;
  death_date: GedcomDate | null;
  death_place: string;
  occupation: string;
  notes: string;
  famc: string | null;
  fams: string[];
}

export interface GedcomFamily {
  id: string;
  gedcom_xref: string;
  husb: string | null;
  wife: string | null;
  chil: string[];
  marr_date: GedcomDate | null;
  marr_place: string;
}

export interface ParseResult {
  persons: Record<string, GedcomPerson>;
  families: Record<string, GedcomFamily>;
  /** Conteggio INDI nel GEDCOM originale (per I8) */
  indiCount: number;
  famCount: number;
}

// ─── Parse qualificatore data ─────────────────────────────────────────────────

function parseDateQual(token: string): DateQual {
  switch (token.toUpperCase()) {
    case 'ABT': case 'ABOUT': return 'A';
    case 'BEF': case 'BEFORE': return 'B';
    case 'AFT': case 'AFTER': return 'R';
    case 'BET': case 'BETWEEN': return 'T';
    case 'CAL': case 'CALC': return 'C';
    case 'EST': case 'ESTIMATED': return 'S';
    default: return 'E';
  }
}

function parseCal(token: string): DateCal {
  const t = token.toUpperCase();
  if (t.includes('JULIAN')) return 'J';
  if (t.includes('HEBREW')) return 'H';
  if (t.includes('FRENCH')) return 'F';
  return 'G';
}

function extractYear(s: string): number | null {
  const m = s.match(/\b(\d{3,4})\b/);
  return m ? parseInt(m[1]) : null;
}

/** Parsa una stringa data GEDCOM completa rispettando I9. */
export function parseGedcomDate(raw: string): GedcomDate {
  if (!raw) return { raw: '', year: null, year2: null, qual: 'E', cal: 'G' };

  let rest = raw.trim();
  let cal: DateCal = 'G';
  let qual: DateQual = 'E';
  let year: number | null = null;
  let year2: number | null = null;

  // Calendario
  const calMatch = rest.match(/@#D([^@]+)@\s*/i);
  if (calMatch) {
    cal = parseCal(calMatch[1]);
    rest = rest.replace(calMatch[0], '').trim();
  }

  // Qualificatore
  const qualMatch = rest.match(/^(ABT|ABOUT|BEF|BEFORE|AFT|AFTER|BET|BETWEEN|CAL|CALC|EST|ESTIMATED)\b\s*/i);
  if (qualMatch) {
    qual = parseDateQual(qualMatch[1]);
    rest = rest.slice(qualMatch[0].length).trim();
  }

  // BET…AND
  if (qual === 'T') {
    const andMatch = rest.match(/^(.+?)\s+AND\s+(.+)$/i);
    if (andMatch) {
      year = extractYear(andMatch[1]);
      year2 = extractYear(andMatch[2]);
    } else {
      year = extractYear(rest);
    }
  } else {
    year = extractYear(rest);
  }

  return { raw, year, year2, qual, cal };
}

// ─── Parser principale ────────────────────────────────────────────────────────

export function parseGedcomFull(gedcomText: string): ParseResult {
  const lines = gedcomText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const persons: Record<string, GedcomPerson> = {};
  const families: Record<string, GedcomFamily> = {};
  let indiCount = 0;
  let famCount = 0;

  let currentType: 'INDI' | 'FAM' | 'OTHER' = 'OTHER';
  let currentId = '';
  let currentTag = '';
  let noteBuffer = '';

  for (const line of lines) {
    const m = line.match(/^(\d+)\s+(@\S+@|\S+)(?:\s+(.*))?$/);
    if (!m) continue;

    const level = parseInt(m[1]);
    const second = m[2];
    const value  = (m[3] ?? '').trim();

    if (level === 0) {
      // Flush pending note
      if (currentType === 'INDI' && currentId && noteBuffer) {
        persons[currentId].notes = noteBuffer.trim();
        noteBuffer = '';
      }

      if (second.startsWith('@') && value === 'INDI') {
        indiCount++;
        const xref = second.replace(/@/g, '');
        currentId   = xref;
        currentType = 'INDI';
        currentTag  = '';
        persons[xref] = {
          id: xref, gedcom_xref: second,
          name: '', surname: '', given_name: '',
          gender: 'U',
          birth_date: null, birth_place: '',
          death_date: null, death_place: '',
          occupation: '', notes: '',
          famc: null, fams: [],
        };
      } else if (second.startsWith('@') && value === 'FAM') {
        famCount++;
        const xref = second.replace(/@/g, '');
        currentId   = xref;
        currentType = 'FAM';
        currentTag  = '';
        families[xref] = {
          id: xref, gedcom_xref: second,
          husb: null, wife: null, chil: [],
          marr_date: null, marr_place: '',
        };
      } else {
        currentType = 'OTHER';
        currentId   = '';
      }
      continue;
    }

    if (level === 1) {
      currentTag = second.toUpperCase();

      if (currentType === 'INDI' && currentId) {
        const p = persons[currentId];
        switch (currentTag) {
          case 'NAME': {
            const slashMatch = value.match(/^(.*?)\s*\/([^/]*)\//);
            if (slashMatch) {
              p.given_name = slashMatch[1].trim();
              p.surname    = slashMatch[2].trim();
            } else {
              const parts  = value.split(/\s+/);
              p.surname    = parts.pop() ?? '';
              p.given_name = parts.join(' ');
            }
            p.name = `${p.given_name} ${p.surname}`.trim();
            break;
          }
          case 'SEX':  p.gender = value === 'M' ? 'M' : value === 'F' ? 'F' : 'U'; break;
          case 'OCCU': p.occupation = value; break;
          case 'NOTE': noteBuffer = value + ' '; break;
          case 'FAMC': p.famc = value.replace(/@/g, ''); break;
          case 'FAMS': p.fams.push(value.replace(/@/g, '')); break;
        }
      }

      if (currentType === 'FAM' && currentId) {
        const f = families[currentId];
        switch (currentTag) {
          case 'HUSB': f.husb = value.replace(/@/g, ''); break;
          case 'WIFE': f.wife = value.replace(/@/g, ''); break;
          case 'CHIL': f.chil.push(value.replace(/@/g, '')); break;
        }
      }
      continue;
    }

    if (level === 2 && currentId) {
      const tag2 = second.toUpperCase();
      if (currentType === 'INDI') {
        const p = persons[currentId];
        if (currentTag === 'BIRT') {
          if (tag2 === 'DATE') p.birth_date  = parseGedcomDate(value);
          if (tag2 === 'PLAC') p.birth_place = value;
        }
        if (currentTag === 'DEAT') {
          if (tag2 === 'DATE') p.death_date  = parseGedcomDate(value);
          if (tag2 === 'PLAC') p.death_place = value;
        }
        if (currentTag === 'NOTE' && tag2 === 'CONT') {
          noteBuffer += value + ' ';
        }
      }
      if (currentType === 'FAM') {
        const f = families[currentId];
        if (currentTag === 'MARR') {
          if (tag2 === 'DATE') f.marr_date  = parseGedcomDate(value);
          if (tag2 === 'PLAC') f.marr_place = value;
        }
      }
    }
  }

  return { persons, families, indiCount, famCount };
}

// ─── Helper: label qualificatore ─────────────────────────────────────────────

function dateQualLabel(qual: DateQual): string {
  const map: Record<DateQual, string> = {
    A: 'ABT', B: 'BEF', R: 'AFT', T: 'BET', C: 'CAL', S: 'EST', E: ''
  };
  return map[qual];
}

function dateToString(d: GedcomDate | null): string {
  if (!d) return '';
  const q = d.qual !== 'E' ? dateQualLabel(d.qual) + ' ' : '';
  return `${q}${d.year ?? ''}`.trim();
}

// ─── Conversione a PersonData (formato UI) ─────────────────────────────────

export function toPersonDataDict(result: ParseResult): Record<string, any> {
  const out: Record<string, any> = {};

  for (const [id, p] of Object.entries(result.persons)) {
    const birthStr = dateToString(p.birth_date);
    const deathStr = dateToString(p.death_date);
    const hasEvents = !!(birthStr || deathStr);

    const worlds: Record<string, WorldMetadata> = {
      '1_origini': {
        id: '1', name: 'ORIGINI', is_active: true,
        color_var: 'var(--accent-color)',
        data: { surname: p.surname, given_name: p.given_name, occupation: p.occupation }
      },
      '2_cicli': {
        id: '2', name: 'CICLI', is_active: hasEvents,
        color_var: 'var(--text-color)',
        data: hasEvents ? {
          events: [
            ...(birthStr ? [`BIRT: ${birthStr}${p.birth_place ? ' · ' + p.birth_place : ''}`] : []),
            ...(deathStr ? [`DEAT: ${deathStr}${p.death_place ? ' · ' + p.death_place : ''}`] : []),
          ]
        } : null
      },
      '3_doni': {
        id: '3', name: 'DONI', is_active: !!p.occupation,
        color_var: 'var(--secondary-color)',
        data: p.occupation ? { occupation: p.occupation } : null
      },
      '4_ombre':    { id: '4', name: 'OMBRE',    is_active: false, color_var: 'var(--alert-color)',     data: null },
      '5_contesto': { id: '5', name: 'CONTESTO',  is_active: false, color_var: 'var(--hint-color)',      data: null },
      '6_struttura':{ id: '6', name: 'STRUTTURA', is_active: false, color_var: 'var(--accent-color)',    data: null },
      '7_eredita':  { id: '7', name: 'EREDITÀ',   is_active: false, color_var: 'var(--secondary-color)', data: null },
      '8_nebbia':   { id: '8', name: 'NEBBIA',    is_active: false, color_var: 'var(--hint-color)',      data: null },
      '9_radici':   { id: '9', name: 'RADICI',    is_active: false, color_var: 'var(--text-color)',      data: null },
    };

    out[id] = {
      id,
      name: p.given_name || p.name,
      surname: p.surname,
      birth: birthStr,
      death: deathStr,
      sex: p.gender,
      isMaleAncestor: p.gender === 'M',
      famc: p.famc,
      fams: p.fams,
      occupation: p.occupation,
      notes: p.notes,
      worlds,
    };
  }

  return out;
}

// ─── Backward-compat: vecchio export parseGedcom ─────────────────────────────

/** @deprecated usa parseGedcomFull + toPersonDataDict */
export const parseGedcom = (gedcomText: string): Record<string, any> => {
  const result = parseGedcomFull(gedcomText);
  return toPersonDataDict(result);
};
