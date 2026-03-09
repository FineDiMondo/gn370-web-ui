# Prototipo GN370 V2.0 - Nove Mondi Interface

Questo repository contiene il prototipo React/Vite dell'interfaccia 9 Mondi (Genealogia Sicula).

## Installazione & Sviluppo

```bash
npm install
npm run dev
```

## Struttura del progetto
- `src/components`: Componenti UI (WorldTile, BootSequence)
- `src/pages`: Pagine primarie (Dashboard, WorldDetail)
- `src/utils/gedcomParser.ts`: Parser GEDCOM client-side
- `src/data`: Database fittizi / fixtures fallbacks
- `public/test_fixtures`: File .ged minimali per testing

## Collaudo Invarianti & CI/CD (Playwright)

Per validare le invarianti di boot e UI (come descritto nel report QA), raccomandiamo l'uso di **Playwright**.

### Setup Playwright

```bash
npm init playwright@latest
```

All'interno di `tests/gn370.spec.ts`, è possibile verificare le invarianti principali:

```typescript
import { test, expect } from '@playwright/test';

test.describe('GN370 Invariants Testing', () => {

  test('I1 & I2: Boot state defaults to EMPTY', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Aspetta fine boot sequence
    await page.waitForTimeout(5000); 

    // Verifica globale DB_STATUS
    const dbStatus = await page.evaluate(() => window.__GN370_DB_STATUS);
    expect(dbStatus).toBe('EMPTY');
    
    // UI deve mostrare sistema in attesa
    await expect(page.locator('text=SISTEMA IN ATTESA')).toBeVisible();
  });

  test('I3: Context openedRecord is null at boot', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(5000); 
    const openedRecord = await page.evaluate(() => window.GN370?.CTX?.openedRecord);
    expect(openedRecord).toBeNull();
  });

  // Aggiungere test I6/I7 per export ZIP usando page.waitForEvent('download')
});
```

Per lanciare i test localmente (dopo aver avviato il server dev):
```bash
npx playwright test
```
