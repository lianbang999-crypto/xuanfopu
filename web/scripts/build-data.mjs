// 选佛谱数据解析脚本
// 职责：以繁体原文(B0136_001~006，格式统一、权威)为骨架，解析出 15门220位；
//       简体白话按「门→位」顺序对齐填充对照内容。
// 原则：一切以繁体原文为准，不臆改、不润饰；对不齐处如实告警，不强行填平。
// 运行：node web/scripts/build-data.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as OpenCC from 'opencc-js';
import { createRequire } from 'node:module';

// 繁→简（仅用于校验时归一名称，消除简繁字形造成的假阳性告警）
const toCN = OpenCC.Converter({ from: 't', to: 'cn' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');            // 选佛谱/
const HANT_DIR = path.join(ROOT, '繁体版');
const VERN_DIR = path.join(ROOT, '简体版白话文');
const OUT = path.join(__dirname, '../src/data/xuanfopu.json');

const HANT_FILES = ['B0136_001.txt','B0136_002.txt','B0136_003.txt','B0136_004.txt','B0136_005.txt','B0136_006.txt'];
const VERN_FILES = ['选佛谱卷第一（白话版）.txt','选佛谱卷第二（白话版）.txt','选佛谱卷第三（白话版）.txt','选佛谱卷第四（白话版）.txt','选佛谱卷第五（白话版）.txt','选佛谱卷第六（白话版）.txt'];

// 各门期望位数（源自原文「凡X位」），用于校验
const EXPECT = [21,5,13,18,23,6,13,13,8,16,10,52,8,13,1];
const SEP = '　　';   // 双全角空格：位名 ↔ 轮相表

// ---------- 工具 ----------
const stripPunct = (s='') => s.replace(/[（）()。，、　\s·\.]/g,'');
// 异体字归一（仅供校验比对，不改动数据）：原文多用异体，白话多用通行字
const NORM_VARIANT = { '徧': '遍', '煖': '暖', '燄': '焰', '著': '着' };
const normVariant = (s='') => s.replace(/[徧煖燄著]/g, (c) => NORM_VARIANT[c] || c);

// 解析原文轮相升降表 → 结构化 transitions
// 例「(那那。阿鼻獄　那謨　謨謨。皆無間獄　阿佛。世間福)」
//   → [{combos:['那那'],to:'阿鼻獄'},{combos:['那謨','謨謨'],to:'無間獄'},{combos:['阿佛'],to:'世間福'}]
// 规则：全角空格分隔；「组合。去向」结句；多个仅组合的 token 累积，遇「。去向」共享（去向前缀「皆」去除）。
// 原文未列出的组合即「不行」（停步），不在表内。
const LUN_CHARS = '那謨阿彌陀佛';
const isCombo2 = (s) => s.length >= 2 && LUN_CHARS.includes(s[0]) && LUN_CHARS.includes(s[1]);

// 从白话正文行剥离「轮相对应」段（已由升降表呈现），保留谱曰释义
function vernPu(bodyLines = []) {
  return bodyLines
    .filter((line) => !/轮相对应/.test(line) && !/^[（(][那谟阿弥陀佛]{2}/.test(line))
    .join('\n');
}

function parseTransitions(lunxiang) {
  if (!lunxiang) return [];
  let inner = lunxiang.replace(/^[(（]/, '').replace(/[)）]$/, '');
  inner = inner.replace(/\[[A-Za-z]*\d*\]/g, ''); // 剔除 CBETA 校注符号（如 [A1]）
  // 全角空格与句号统一作分隔：部分位次组合间以句号分隔（如「那陀。謨陀。皆魔天」＝那陀、谟陀皆→魔天）
  const segs = inner.split(/[　。\s]+/).map((s) => s.trim()).filter(Boolean);
  const out = [];
  let pending = [];
  for (const seg of segs) {
    if (isCombo2(seg) && seg.length === 2) {
      pending.push(seg); // 纯组合，等待共享去向
    } else if (isCombo2(seg) && seg.length > 2) {
      // 缺分隔的「组合+去向」连写：如「彌陀少財鬼」「阿陀皆九想觀」
      pending.push(seg.slice(0, 2));
      out.push({ combos: pending, to: seg.slice(2).replace(/^[皆俱並并]/, '') });
      pending = [];
    } else {
      const to = seg.replace(/^[皆俱並并]/, ''); // 去向（去「皆」前缀）
      if (pending.length) {
        out.push({ combos: pending, to });
        pending = [];
      } else if (out.length) {
        out[out.length - 1].to += to; // 去向被分隔断开的碎片，并回前一去向
      }
    }
  }
  return out;
}

// ============================================================
// 一、解析繁体原文 → 骨架
// ============================================================
// 序号精确匹配：第一~第十用单字，十一~十五用「十X」（避免「第三四種惡趣門」的「四」被吞入序号）
const GATE_RE = /^((?:第(?:十|[一二三四五六七八九]))|(?:十[一二三四五]))(.+?門)\(凡(.+?)位\)$/;

function parseHant() {
  const data = { preface:[], lunxiang:[], gates:[], colophon:[] };
  let mode = 'head';            // head|preface|lunxiang|gates|colophon
  let gate = null, pos = null;

  for (let fi = 0; fi < HANT_FILES.length; fi++) {
    const file = HANT_FILES[fi];
    const lines = fs.readFileSync(path.join(HANT_DIR, file), 'utf-8').split(/\r?\n/);
    for (let li = 0; li < lines.length; li++) {
      const raw = lines[li];
      const t = raw.trim();
      const src = `${file.replace('.txt','')}:L${li+1}`;
      if (!t) continue;
      if (t.startsWith('#')) continue;            // 文件头注释
      if (t.startsWith('【圖')) continue;          // 图片标记

      // —— 段落/章节切换 ——
      if (t === '選佛譜敘') { mode = 'preface'; continue; }
      if (t.startsWith('輪相表法')) { mode = 'lunxiang'; data.lunxiang.push(t); continue; }
      if (t === '位次升降第二') { mode = 'lunxiang'; data.lunxiang.push(t); continue; }
      if (t.startsWith('選佛譜卷第')) continue;     // 卷标题 / 卷终
      if (t === '紀事') { mode = 'colophon'; continue; }
      if (/門竟$/.test(t)) { pos = null; continue; } // 某门结束

      // —— 门标题 ——
      const gm = t.match(GATE_RE);
      if (gm || t === '十五圓極果位門') {
        mode = 'gates';
        gate = {
          id: data.gates.length + 1,
          ord: gm ? gm[1] : '十五',
          name_hant: gm ? (gm[1].replace(/^第/,'') ).replace(/[一二三四五六七八九十]+$/,'') && gm[2] : '圓極果位門',
          name_full_hant: gm ? `${gm[1]}${gm[2]}` : '十五圓極果位門',
          count_hant: gm ? gm[3] : '一',
          intro_hant: '',
          positions: [],
        };
        // name_hant 简化：取「門」结尾的纯名（如 發始因地門）
        gate.name_hant = gm ? gm[2] : '圓極果位門';
        data.gates.push(gate);
        pos = null;
        continue;
      }

      if (mode === 'preface') { data.preface.push(t); continue; }
      if (mode === 'lunxiang') { data.lunxiang.push(t); continue; }
      if (mode === 'colophon') { data.colophon.push(t); continue; }

      if (mode === 'gates' && gate) {
        // 第十五门特殊：佛 + 描述行（无轮相表）
        if (gate.id === 15) {
          if (t.startsWith('譜曰')) {
            if (pos) pos.pu_hant = t; else gate.intro_hant = t;
            continue;
          }
          if (t === '佛') {
            pos = { combo:null, name_hant:'佛', lunxiang_hant:'', extra_hant:[], pu_hant:'', source:src };
            gate.positions.push(pos);
            continue;
          }
          if (pos) { pos.extra_hant.push(t); continue; }   // 圓教究竟妙覺位 等
          continue;
        }

        // 谱曰
        if (t.startsWith('譜曰')) {
          if (pos) pos.pu_hant = t; else gate.intro_hant = t; // 门序谱曰
          continue;
        }
        // 位次行：含双全角空格，且其后以 ( 开头
        if (raw.includes(SEP)) {
          const idx = raw.indexOf(SEP);
          const namePart = raw.slice(0, idx).trim();
          const tablePart = raw.slice(idx + SEP.length).trim();
          if (tablePart.startsWith('(')) {
            const cm = namePart.match(/^\(([那謨阿彌陀佛]{2})\)(.+)$/); // 发始因地门组合前缀
            pos = {
              combo: cm ? cm[1] : null,
              name_hant: cm ? cm[2] : namePart,
              lunxiang_hant: tablePart,
              pu_hant: '',
              source: src,
            };
            gate.positions.push(pos);
            continue;
          }
        }
        // 其余行（如校勘 [A1]）忽略
      }
    }
  }

  return {
    preface_hant: data.preface.join('\n'),
    lunxiang_hant: data.lunxiang.join('\n'),
    colophon_hant: data.colophon.join('\n'),
    gates: data.gates,
  };
}

// ============================================================
// 二、解析白话 → 按 门/位 顺序的块
// ============================================================
function parseVern() {
  const out = { preface:'', lunxiang:'', colophon:'', gates:[] };
  let cur = null;          // 当前累积目标位次
  let gate = null;
  let mode = 'none';       // none|preface|lunxiang|gate-intro|pos|colophon
  const buf = { preface:[], lunxiang:[], colophon:[] };

  const isGateTitle = (s) => /^第[一二三四五六七八九十]+\s*.*[門门]/.test(s);

  for (const file of VERN_FILES) {
    const lines = fs.readFileSync(path.join(VERN_DIR, file), 'utf-8').split(/\r?\n/);
    for (const raw of lines) {
      const h = raw.match(/^#{1,6}\s+(.+?)\s*$/);
      if (h) {
        const title = h[1].trim();
        if (/卷第/.test(title)) { continue; }                 // 卷标题
        if (/叙/.test(title)) { mode='preface'; continue; }    // 选佛谱叙
        if (/^轮相表法/.test(title)) { mode='lunxiang'; buf.lunxiang.push(title); continue; }
        if (/^位次升降/.test(title)) { mode='lunxiang'; buf.lunxiang.push(title); continue; }
        if (/^纪事/.test(title)) { mode='colophon'; continue; } // 纪事题跋 → 附录
        if (isGateTitle(title)) {                              // 门标题
          gate = { title, intro:[], positions:[] };
          out.gates.push(gate);
          mode = 'gate-intro';
          continue;
        }
        // 其余标题 = 位次标题
        if (gate) {
          const p = { name_vern: title, body:[] };
          gate.positions.push(p);
          mode = 'pos';
          cur = p;
        }
        continue;
      }
      // 正文行
      const t = raw.trim();
      if (!t) continue;
      if (/^选佛谱卷第/.test(t)) continue;                     // 卷终行
      if (mode === 'preface') buf.preface.push(t);
      else if (mode === 'lunxiang') buf.lunxiang.push(t);
      else if (mode === 'colophon') buf.colophon.push(t);
      else if (mode === 'gate-intro' && gate) gate.intro.push(t);
      else if (mode === 'pos' && cur) cur.body.push(t);
    }
  }
  out.preface = buf.preface.join('\n');
  out.lunxiang = buf.lunxiang.join('\n');
  out.colophon = buf.colophon.join('\n');
  return out;
}

// ============================================================
// 三、合并 + 校验
// ============================================================
// ---------- 手工校订层（data-core/manual：每位 21 条，含行/不行 + 原文原因）----------
const _require = createRequire(import.meta.url);
const MANUAL_DP = {};
try {
  globalThis.window = {};
  _require(path.join(ROOT, 'data-core/data/positions-manual.js'));
  const M = globalThis.window.POSITIONS_MANUAL || {};
  for (const [slug, m] of Object.entries(M)) {
    const mm = slug.match(/^(\d{2})-(\d{2})-/);
    if (mm) MANUAL_DP[mm[1] + '-' + mm[2]] = m;
  }
} catch (e) {
  console.warn('⚠ manual 加载失败：', e.message);
}

// 取某门某位的手工校订 21 条轮相（行 + 不行 + 原文原因）
function manualLun(door, pos) {
  const m = MANUAL_DP[String(door).padStart(2, '0') + '-' + String(pos).padStart(2, '0')];
  if (!m || !Array.isArray(m.lun)) return null;
  return m.lun.map((L) => ({
    combo: L.dice,
    target: L.off ? null : L.target,
    note: (L.note || '').trim(),
    off: !!L.off,
  }));
}

function build() {
  const H = parseHant();
  const V = parseVern();
  const warnings = [];

  // 门数校验
  if (H.gates.length !== 15) warnings.push(`繁体门数=${H.gates.length}，期望15`);
  if (V.gates.length !== 15) warnings.push(`白话门数=${V.gates.length}，期望15`);

  const gates = H.gates.map((g, gi) => {
    const vg = V.gates[gi];
    // 位数校验
    if (g.positions.length !== EXPECT[gi])
      warnings.push(`第${gi+1}门 繁体位数=${g.positions.length}，期望${EXPECT[gi]}`);
    if (vg && vg.positions.length !== g.positions.length)
      warnings.push(`第${gi+1}门 白话位数=${vg ? vg.positions.length : '缺'}，繁体=${g.positions.length}`);

    const positions = g.positions.map((p, pi) => {
      const vp = vg && vg.positions[pi];
      // 名称一致性校验：繁名先归一为简，去标点后比对核心字（白话名或带组合前缀/括注，用包含关系）
      if (vp) {
        const a = stripPunct(normVariant(toCN(p.name_hant)));
        const b = stripPunct(normVariant(vp.name_vern));
        if (!(b.includes(a) || a.includes(b)))
          warnings.push(`第${gi+1}门第${pi+1}位 名称疑似不齐: 繁「${p.name_hant}」(简「${toCN(p.name_hant)}」) 白「${vp.name_vern}」`);
      }
      return {
        id: `g${gi+1}p${pi+1}`,
        combo: p.combo || null,
        name_hant: p.name_hant,
        name_vern: vp ? vp.name_vern : '',
        lunxiang_hant: p.lunxiang_hant || '',
        extra_hant: p.extra_hant ? p.extra_hant.join('\n') : '',
        pu_hant: p.pu_hant || '',
        pu_vern: vp ? vernPu(vp.body) : '',
        transitions: parseTransitions(p.lunxiang_hant),  // 结构化升降表（组合→去向）
        lun: manualLun(gi + 1, pi + 1),                   // 手工校订 21 条（行/不行 + 原文原因）
        source: p.source,
      };
    });

    return {
      id: gi + 1,
      ord: g.ord,
      name_hant: g.name_hant,
      name_full_hant: g.name_full_hant,
      name_vern: vg ? vg.title : '',
      count: g.positions.length,
      intro_hant: g.intro_hant || '',
      intro_vern: vg ? vg.intro.join('\n') : '',
      positions,
    };
  });

  const totalPos = gates.reduce((n, g) => n + g.positions.length, 0);

  const result = {
    meta: {
      title: '選佛譜',
      author: '北天目蕅益沙門智旭',
      source: 'CBETA 大藏經補編 第24冊 No.136',
      note: '繁体为原文骨架，白话为对照；一切以繁体原文为准。',
      gateCount: gates.length,
      positionCount: totalPos,
    },
    preface: { hant: H.preface_hant, vern: V.preface },
    lunxiang: { hant: H.lunxiang_hant, vern: V.lunxiang },
    gates,
    colophon: { hant: H.colophon_hant, vern: V.colophon },
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf-8');

  // ---------- 校验报告 ----------
  console.log('=== 选佛谱数据构建 ===');
  console.log(`门数: ${gates.length} (期望15)`);
  console.log(`位数合计: ${totalPos} (期望220)`);
  console.log('各门位数:');
  gates.forEach((g, i) =>
    console.log(`  ${g.id}. ${g.name_full_hant}  位=${g.count} 期望=${EXPECT[i]}` +
      (g.count === EXPECT[i] ? '' : '  ⚠️')));
  // 空字段统计
  let emptyHant=0, emptyPu=0, emptyVern=0;
  gates.forEach(g => g.positions.forEach(p => {
    if (!p.lunxiang_hant && g.id!==15) emptyHant++;
    if (!p.pu_hant) emptyPu++;
    if (!p.pu_vern) emptyVern++;
  }));
  console.log(`空轮相表(非15门): ${emptyHant}  空繁谱曰: ${emptyPu}  空白话正文: ${emptyVern}`);
  console.log(`告警 ${warnings.length} 条:`);
  warnings.slice(0, 40).forEach(w => console.log('  - ' + w));
  if (warnings.length > 40) console.log(`  …其余 ${warnings.length-40} 条`);
  console.log(`输出: ${path.relative(ROOT, OUT)}`);
}

build();
