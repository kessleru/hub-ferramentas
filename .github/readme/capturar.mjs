/**
 * Captura as telas do README com o Chrome instalado, em 2x.
 *
 * Com o app no ar (pnpm build && pnpm start):
 *   pnpm add -D puppeteer-core sharp   (desfaça com git restore package.json pnpm-lock.yaml)
 *   node .github/readme/capturar.mjs [url-base]
 *
 * Chrome fora do caminho padrão: defina CHROME=/caminho/do/chrome.
 */
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE_PADRAO = 'http://localhost:3000';

const TELAS = [
  { arquivo: 'catalogo.png', caminho: '/', largura: 1280, altura: 460 },
  { arquivo: 'mobile.png', caminho: '/', largura: 500, altura: 1000, mobile: true },
];

const SAIDA = import.meta.dirname;
const BASE = process.argv[2] ?? BASE_PADRAO;
const CHROME =
  process.env.CHROME ??
  {
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    linux: '/usr/bin/google-chrome',
  }[process.platform];

// Animações de entrada congelam no meio da captura: aqui elas terminam na hora.
const SEM_ANIMACAO =
  '*,*::before,*::after{animation-duration:1ms!important;animation-delay:0s!important;' +
  'animation-iteration-count:1!important;transition-duration:0s!important;transition-delay:0s!important;' +
  'scroll-behavior:auto!important;caret-color:transparent!important}';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });

for (const t of TELAS) {
  const page = await browser.newPage();
  // 2x: sem isso o PNG borra em tela retina. 500 é a largura mínima do Chrome.
  await page.setViewport({ width: t.largura, height: t.altura, deviceScaleFactor: 2, isMobile: !!t.mobile, hasTouch: !!t.mobile });
  // Tema fixo: sem isso o Chrome herda o tema do sistema de quem roda.
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: t.tema ?? 'light' }]);
  if (t.semJs) await page.setJavaScriptEnabled(false);
  // Estado salvo que o app lê ao carregar (ex.: tema ou slide atual).
  if (t.armazenamento) {
    await page.evaluateOnNewDocument((itens) => {
      for (const [chave, valor] of Object.entries(itens)) localStorage.setItem(chave, valor);
    }, t.armazenamento);
  }
  await page.goto(BASE + t.caminho, { waitUntil: 'networkidle0', timeout: 60000 });
  if (!t.animar) await page.addStyleTag({ content: SEM_ANIMACAO });
  // Rola a página inteira para disparar o que só aparece no scroll.
  if (!t.semJs) await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, 0);
  });
  if (t.antes && !t.semJs) await page.evaluate(t.antes);
  await new Promise((r) => setTimeout(r, t.espera ?? 1500));
  const bruto = await page.screenshot({ fullPage: !!t.inteira, captureBeyondViewport: !!t.inteira });
  // PNG com paleta para interface; JPEG para página cheia de fotos (PNG passaria de 400 KB).
  const imagem = t.arquivo.endsWith('.jpg')
    ? sharp(bruto).jpeg({ quality: 78, mozjpeg: true })
    : sharp(bruto).png({ palette: true, quality: 85, compressionLevel: 9, effort: 10 });
  const arquivo = join(SAIDA, t.arquivo);
  writeFileSync(arquivo, await imagem.toBuffer());
  console.log(`✓ ${t.arquivo}  ${(statSync(arquivo).size / 1024).toFixed(0)} KB`);
  await page.close();
}
await browser.close();
