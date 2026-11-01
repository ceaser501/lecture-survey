// lv-widget.js 만들기: src/lv-widget.src.js + QR 생성기(qrcode-generator, MIT)를 한 파일로 합친다.
// 사용: (tools 폴더에서 npm i 한 번) node tools/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { minify } from 'terser';
const root = new URL('..', import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(root + 'config.json', 'utf8'));
const qrSrc = readFileSync(root + 'tools/node_modules/qrcode-generator/dist/qrcode.js', 'utf8')
  .replace(/\(function \(factory\)[\s\S]*$/, '');
const qrMin = (await minify(qrSrc + '\nwindow.__lvqr = qrcode;', { compress: true, mangle: true })).code;
let src = readFileSync(root + 'src/lv-widget.src.js', 'utf8');
src = src.replace("/*@@QRCODE@@*/ null", '(function(){var window={};' + qrMin + 'return window.__lvqr;})()')
         .replace("'@@ANON_KEY@@'", JSON.stringify(cfg.anonKey))
         .replace("'https://gxyckkinlygeasruapmj.supabase.co'", JSON.stringify(cfg.supabaseUrl))
         .replace("'https://ceaser501.github.io/lecture-survey/'", JSON.stringify(cfg.site));
writeFileSync(root + 'lv-widget.js', '/* lv-widget.js — 자동 생성 파일 (원본: src/lv-widget.src.js, 만들기: node tools/build.mjs)\n   QR 부분: qrcode-generator (c) 2009 Kazuhiko Arase, MIT License */\n' + src);
console.log('lv-widget.js', (src.length / 1024).toFixed(1) + 'KB');
