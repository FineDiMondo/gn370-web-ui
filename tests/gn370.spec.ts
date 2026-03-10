/**
 * GN370 V2.0 — E2E Test Suite (Playwright)
 *
 * Invarianti verificate:
 *   I1  — Nessuna fetch di dati al boot EMPTY
 *   I2  — window.__GN370_DB_STATUS === 'EMPTY' al boot
 *   I3  — GN370.CTX.openedRecord === null al boot
 *   I6  — ZIP filename matcha /^\d{12}\.zip$/
 *   I8  — INDI count GEDCOM = opzioni nel combobox
 *   I9  — ABT 1500 → visualizzato "ABT 1500"
 *   VH-02 — Import solo via user gesture
 *   S0-3  — LOAD DEMO carica persone
 *   S0-5  — Variabile globale esposta
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE = path.join(__dirname, '..', 'public', 'test_fixtures', 'sample-minimal.ged');

// ─── Helper ────────────────────────────────────────────────────────────────

async function waitForEmptyState(page: any) {
  await page.waitForSelector('text=SISTEMA IN ATTESA', { timeout: 15_000 });
}

async function loadDemo(page: any) {
  await waitForEmptyState(page);
  await page.click('text=[ LOAD DEMO DATASET ]');
  await page.waitForSelector('select', { timeout: 10_000 });
}

async function uploadFixture(page: any) {
  await waitForEmptyState(page);
  const chooser = page.waitForEvent('filechooser');
  await page.click('text=[ UPLOAD GEDCOM (.GED) ]');
  const fc = await chooser;
  await fc.setFiles(FIXTURE);
  await page.waitForSelector('select', { timeout: 10_000 });
}

// ─── I1 / I2 / I3 — Boot EMPTY ─────────────────────────────────────────────

test.describe('Boot EMPTY (I1, I2, I3)', () => {

  test('I2: __GN370_DB_STATUS === EMPTY al boot', async ({ page }) => {
    await page.goto('/');
    await waitForEmptyState(page);
    const status = await page.evaluate(() => (window as any).__GN370_DB_STATUS);
    expect(status).toBe('EMPTY');
  });

  test('I3: GN370.CTX.openedRecord è null al boot', async ({ page }) => {
    await page.goto('/');
    await waitForEmptyState(page);
    const rec = await page.evaluate(() => (window as any).GN370?.CTX?.openedRecord ?? null);
    expect(rec).toBeNull();
  });

  test('I1: Nessuna richiesta XHR/Fetch al boot EMPTY', async ({ page }) => {
    const fetches: string[] = [];
    page.on('request', (req: any) => {
      const t = req.resourceType();
      if (t === 'xhr' || t === 'fetch') fetches.push(req.url());
    });
    await page.goto('/');
    await waitForEmptyState(page);
    expect(fetches).toHaveLength(0);
  });

});

// ─── VH-02 — User Gesture ───────────────────────────────────────────────────

test.describe('VH-02: Import solo user gesture', () => {

  test('UI mostra SISTEMA IN ATTESA e bottoni di import', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=SISTEMA IN ATTESA')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('text=[ UPLOAD GEDCOM (.GED) ]')).toBeVisible();
    await expect(page.locator('text=[ LOAD DEMO DATASET ]')).toBeVisible();
  });

  test('File input è nascosto (display:none)', async ({ page }) => {
    await page.goto('/');
    await waitForEmptyState(page);
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeHidden();
  });

});

// ─── I8 / I9 — GEDCOM Parser ────────────────────────────────────────────────

test.describe('GEDCOM Parser (I8, I9)', () => {

  test('I8: 5 INDI nel fixture → 5 opzioni nel combobox', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);
    const count = await page.locator('select option').count();
    expect(count).toBe(5);
  });

  test('I9: ABT 1500 → visualizzato "ABT 1500" nell\'header', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);
    // Seleziona Pietro Giardina (I1) che ha BIRT ABT 1500
    await page.selectOption('select', 'I1');
    await expect(page.locator('text=ABT 1500')).toBeVisible({ timeout: 5_000 });
  });

  test('I9: tutti i qualificatori data sono supportati', async ({ page }) => {
    await page.goto('/');
    await uploadFixture(page);

    // BEF — Maria Neri I2
    await page.selectOption('select', 'I2');
    await expect(page.locator('text=BEF 1510')).toBeVisible({ timeout: 5_000 });

    // CAL — Giovanni Giardina I3
    await page.selectOption('select', 'I3');
    await expect(page.locator('text=CAL 1525')).toBeVisible({ timeout: 5_000 });

    // EST — Caterina Russo I4
    await page.selectOption('select', 'I4');
    await expect(page.locator('text=EST 1530')).toBeVisible({ timeout: 5_000 });

    // BET — Luigi Giardina I5
    await page.selectOption('select', 'I5');
    await expect(page.locator('text=BET 1550')).toBeVisible({ timeout: 5_000 });
  });

});

// ─── I6 / VH-09 — Export ZIP ────────────────────────────────────────────────

test.describe('Export ZIP (I6 / VH-09)', () => {

  test('I6: filename ZIP matcha /^\\d{12}\\.zip$/', async ({ page }) => {
    await page.goto('/');
    await loadDemo(page);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=[ EXPORT ZIP ]'),
    ]);
    expect(download.suggestedFilename()).toMatch(/^\d{12}\.zip$/);
  });

});

// ─── S0-3 / S0-5 — Demo Dataset ─────────────────────────────────────────────

test.describe('Demo Dataset (S0-3, S0-5)', () => {

  test('S0-3: LOAD DEMO carica >100 persone nel combobox', async ({ page }) => {
    await page.goto('/');
    await loadDemo(page);
    const count = await page.locator('select option').count();
    expect(count).toBeGreaterThan(100);
  });

  test('S0-5: __GN370_DB_STATUS === READY dopo LOAD DEMO', async ({ page }) => {
    await page.goto('/');
    await loadDemo(page);
    const status = await page.evaluate(() => (window as any).__GN370_DB_STATUS);
    expect(status).toBe('READY');
  });

  test('S0-5: GN370.CTX.openedRecord non è null dopo LOAD DEMO', async ({ page }) => {
    await page.goto('/');
    await loadDemo(page);
    const rec = await page.evaluate(() => (window as any).GN370?.CTX?.openedRecord);
    expect(rec).not.toBeNull();
  });

});
