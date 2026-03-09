/**
 * journalManager — JOURNAL APPEND-ONLY
 * GN370 V2.0 · STEP 09 (journal.js) · VH-07
 *
 * INVARIANTE I13: qualsiasi tentativo di UPDATE o DELETE → throw
 * Il journal è la fonte di audit trail del sistema.
 * Persistenza: sessionStorage (in-browser, non persistente tra sessioni).
 */

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export type JournalOpType =
  | 'SESSION_START'
  | 'SESSION_END'
  | 'GEDCOM_IMPORT'
  | 'HERALDRY_IMPORT'
  | 'EXPORT'
  | 'VALIDATE'
  | 'RESET'
  | 'ERROR';

export type JournalEnv = 'DEV' | 'TEST' | 'PROD';

export interface JournalEntry {
  journal_id: string;       // GNJ-<timestamp>-<seq>
  entry_ts: string;         // ISO 8601
  op_type: JournalOpType;
  entity_type?: string;
  entity_id?: string;
  entity_count?: number;
  description: string;
  operator: string;
  session_id: string;
  env: JournalEnv;
}

// ─── Costanti ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'GN370_JOURNAL';
const SESSION_ID = `SES-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
let _seq = 0;

function getEnv(): JournalEnv {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'DEV';
  if (hostname.includes('staging') || hostname.includes('test')) return 'TEST';
  return 'PROD';
}

// ─── Lettura (read-only) ───────────────────────────────────────────────────────

export function journalRead(): JournalEntry[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

// ─── Append (unica operazione consentita) ─────────────────────────────────────

export function journalAppend(
  opType: JournalOpType,
  description: string,
  extras?: Partial<Pick<JournalEntry, 'entity_type' | 'entity_id' | 'entity_count'>>
): JournalEntry {
  _seq++;
  const entry: JournalEntry = {
    journal_id: `GNJ-${Date.now()}-${String(_seq).padStart(4, '0')}`,
    entry_ts: new Date().toISOString(),
    op_type: opType,
    description,
    operator: 'GN370-USER',
    session_id: SESSION_ID,
    env: getEnv(),
    ...extras,
  };

  const current = journalRead();
  current.push(entry);

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // sessionStorage pieno: journal non critico per UI, continua
    console.warn('GN370 JOURNAL: sessionStorage quota exceeded, entry not persisted');
  }

  return entry;
}

// ─── UPDATE / DELETE → THROW (VH-07 · I13) ───────────────────────────────────

/** @throws {Error} sempre — VH-07: JOURNAL APPEND-ONLY */
export function journalUpdate(_id: string, _patch: Partial<JournalEntry>): never {
  throw new Error(
    'GN370 VH-07 VIOLATION: JOURNAL is APPEND-ONLY. ' +
    'UPDATE operations are forbidden. Invariant I13.'
  );
}

/** @throws {Error} sempre — VH-07: JOURNAL APPEND-ONLY */
export function journalDelete(_id: string): never {
  throw new Error(
    'GN370 VH-07 VIOLATION: JOURNAL is APPEND-ONLY. ' +
    'DELETE operations are forbidden. Invariant I13.'
  );
}

// ─── Helper di avvio sessione ─────────────────────────────────────────────────

export function journalSessionStart(): void {
  journalAppend('SESSION_START', `GN370 session started · ENV=${getEnv()}`);
}

export function journalSessionEnd(): void {
  const entries = journalRead();
  journalAppend('SESSION_END', `GN370 session ended · ${entries.length} entries`);
}

// ─── Export istanza singleton (per import semplificato) ───────────────────────

export const journal = {
  append: journalAppend,
  read: journalRead,
  update: journalUpdate,
  delete: journalDelete,
  sessionStart: journalSessionStart,
  sessionEnd: journalSessionEnd,
} as const;

export default journal;
