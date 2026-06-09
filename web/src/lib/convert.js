// 简繁转换封装（基于 opencc-js，词组级转换）
// 三种显示模式：
//   'orig' 原貌  —— 不转换（左繁体原文 / 右简体白话）
//   'cn'   全简  —— 全站简体（繁体原文转简，白话本就是简）
//   'hant' 全繁  —— 全站繁体（白话转繁，原文本就是繁）
// 说明：自动转换以 OpenCC 词库为准；佛教名相个别一对多（如 後/后、裡/里）若有差池，
//       可在 EXTRA_* 自定义词表逐步校正，不强行、不臆改。

import * as OpenCC from 'opencc-js';

// 繁(OpenCC 标准繁) → 简
const _toCN = OpenCC.Converter({ from: 't', to: 'cn' });
// 简 → 繁(OpenCC 标准繁，贴近原文字形，不取台湾用词)
const _toHant = OpenCC.Converter({ from: 'cn', to: 't' });

// 自定义校正（key 为转换后疑误，value 为正字）；佛典名相按需补充
const EXTRA_CN = {};
const EXTRA_HANT = {};

function applyExtra(text, table) {
  let out = text;
  for (const [k, v] of Object.entries(table)) out = out.split(k).join(v);
  return out;
}

export function toCN(text) {
  if (!text) return text;
  return applyExtra(_toCN(text), EXTRA_CN);
}

export function toHant(text) {
  if (!text) return text;
  return applyExtra(_toHant(text), EXTRA_HANT);
}

/**
 * 按显示模式转换文本。
 * @param {string} text   原文本
 * @param {string} mode   'orig' | 'cn' | 'hant'
 * @param {string} origin 该文本本来的字体：'hant'(繁体原文) | 'vern'(简体白话)
 */
export function convert(text, mode, origin) {
  if (!text || mode === 'orig') return text;
  if (mode === 'cn') return origin === 'hant' ? toCN(text) : text;
  if (mode === 'hant') return origin === 'vern' ? toHant(text) : text;
  return text;
}
