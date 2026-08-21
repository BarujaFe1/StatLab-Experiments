import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'https://statlab-ab.vercel.app';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 60000 });

async function clickScenario(name) {
  const chip = page.getByRole('button', { name }).first();
  if (await chip.count()) {
    await chip.click();
    await page.waitForTimeout(3000);
    return true;
  }
  return false;
}

// 02 — Melhora (demo padrão; fallback via botão de demonstração)
if (!(await clickScenario(/Melhora/i))) {
  await page.getByRole('button', { name: /Começar com cenário Melhora|Demo padrão/i }).first().click();
  await page.waitForTimeout(3500);
}
await page.screenshot({ path: path.join(outDir, '02-analyze-melhora.png'), fullPage: false });

// 03 — Regressão (guard do P0: B significativamente pior)
await clickScenario(/Regressão/i);
await page.screenshot({ path: path.join(outDir, '03-analyze-regressao.png'), fullPage: false });

// 04 — Efeito Fraco
await clickScenario(/Efeito Fraco/i);
await page.screenshot({ path: path.join(outDir, '04-analyze-efeito-fraco.png'), fullPage: false });

// 01 — Planejar
await page.getByRole('tab', { name: 'Planejar' }).click();
await page.getByRole('button', { name: /Calcular/i }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(outDir, '01-plan-sample-size.png'), fullPage: false });

// 05 — chips de cenários
await page.screenshot({ path: path.join(outDir, '05-scenarios-chips.png'), fullPage: true });
await browser.close();
console.log('screenshots ok ->', outDir);
