// 방별 QR 이미지 만들기: qr/w1.png, qr/w1.svg … (node tools/make-qr.mjs w1 w2 w3)
import QRCode from 'qrcode';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const { site } = JSON.parse(readFileSync(root + 'config.json', 'utf8'));
const rooms = process.argv.slice(2).length ? process.argv.slice(2) : ['w1', 'w2', 'w3'];
mkdirSync(root + 'qr', { recursive: true });
for (const r of rooms) {
  const url = site.replace(/\/?$/, '/') + '?r=' + r;
  await QRCode.toFile(root + `qr/${r}.png`, url, { errorCorrectionLevel: 'M', margin: 4, width: 1200, color: { dark: '#000000', light: '#ffffff' } });
  writeFileSync(root + `qr/${r}.svg`, await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 4 }));
  console.log(r, url);
}
