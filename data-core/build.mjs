// ============================================
// data-core 預編譯腳本
// 用途：把 auto+manual+door15 合併＋去注釋＋緊湊 JSON dump，
//      讓水墨版首屏不必同步加載 1.7MB 原始檔，僅需 ~400KB 預編譯產物。
// 運行：node data-core/build.mjs
// 產物：data-core/prebuilt-positions.min.js
// ============================================
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// vm 沙箱 + window 墊片
const ctx = { window: {}, console, Math, Map, Set, JSON, Array, Object, String, RegExp };
ctx.globalThis = ctx;
vm.createContext(ctx);

const load = (rel) => {
  const file = path.join(__dirname, rel);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: rel });
};

// 按 index.html 順序載入
load("data/positions-auto.js");
load("data/positions-manual.js");
load("data.js");
// 此時 window.POSITIONS 已完整 merge（含 door15）

const W = ctx.window;
const POSITIONS = W.POSITIONS;
if (!POSITIONS || POSITIONS.length !== 220) {
  console.error(`✗ POSITIONS 不為 220 位（實際 ${POSITIONS && POSITIONS.length}）`);
  process.exit(1);
}

// 緊湊 JSON（無縮排，最大可省 ~60%）
const json = JSON.stringify(POSITIONS);

const out = `// 預編譯產物：由 data-core/build.mjs 從 auto+manual+door15 合併而成
// 生成時間 ${new Date().toISOString()}
// 取代首屏對 positions-auto.js (608KB) + positions-manual.js (956KB) 的同步加載
// data.js 仍需加載（提供 BOOK/DOORS/LUN_BIAO/別名表等元數據）—它會檢測 POSITIONS 已存在則跳過 merge
window.POSITIONS = ${json};
`;

const outPath = path.join(__dirname, "prebuilt-positions.min.js");
fs.writeFileSync(outPath, out);
// 計算 UTF-8 真實字節（中文一字佔 3 byte，不能用 string.length 騙自己）
const newSize = fs.statSync(outPath).size;
const origSize = fs.statSync(path.join(__dirname, "data/positions-auto.js")).size
               + fs.statSync(path.join(__dirname, "data/positions-manual.js")).size;
const gzipBytes = (s) => {
  const zlib = require("zlib");
  return zlib.gzipSync(s).length;
};
console.log(`✓ 預編譯產物：${(newSize / 1024).toFixed(0)}KB  (gzip: ${(gzipBytes(out) / 1024).toFixed(0)}KB)`);
console.log(`  原始 auto+manual：${(origSize / 1024).toFixed(0)}KB`);
console.log(`  節省：${((1 - newSize / origSize) * 100).toFixed(0)}%（${((origSize - newSize) / 1024).toFixed(0)}KB）`);
console.log(`  位次數：${POSITIONS.length}`);
