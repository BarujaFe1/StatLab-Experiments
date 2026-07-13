import { chromium } from '../frontend/node_modules/playwright-core/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('https://statlab-ab.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });

const winnerChip = page.getByRole('button', { name: /Vencedor/i }).first();
if (await winnerChip.count()) {
  await winnerChip.click();
} else {
  await page.getByRole('button', { name: /Começar com cenário Vencedor|Demo padrão/i }).first().click();
}
await page.waitForTimeout(3500);
await page.screenshot({ path: path.join(outDir, '02-analyze-vencedor.png'), fullPage: false });

await page.getByRole('tab', { name: 'Planejar' }).click();
await page.getByRole('button', { name: /Calcular/i }).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(outDir, '01-plan-sample-size.png'), fullPage: false });

const weak = page.getByRole('button', { name: /Efeito Fraco/i }).first();
if (await weak.count()) {
  await page.getByRole('tab', { name: 'Analisar' }).click();
  await weak.click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(outDir, '03-analyze-efeito-fraco.png'), fullPage: false });
}

await page.screenshot({ path: path.join(outDir, '04-scenarios-chips.png'), fullPage: true });
await browser.close();
console.log('screenshots ok ->', outDir);
