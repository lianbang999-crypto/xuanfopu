// ============================================
// 選佛譜 · 共享引擎（data-core · 無 DOM · 可被各版本復用）
//
// 載入順序（須在本檔之前）：
//   data/positions-auto.js → data/positions-manual.js → data.js → six-chars.js
// 依賴 window.POSITIONS / POSITION_NAME_TO_SLUG / POSITION_ALIASES_CONTEXT /
//      SIX_CHARS / DICE_COMBINATIONS / DOORS …（皆由上列數據檔提供）
//
// 對外：window.ZEN = { … 純工具函數 … , resolveLun, parseBonus }
//
// 設計原則（守 values.md）：
//   · 升降去向一律由數據精確查得，絕不由模型/UI 臆造。
//   · 「贈X／贈X擲／圓向贈一擲」須正確拆解為「去向(可空) + 額外擲X次」，
//     不得因正則殘留（如殘「擲」字）而把真實去向「靜默吞成停留」。
//   · 查不到去向名時如實標 unresolved，不謊報停留。
// ============================================
(function () {
  "use strict";

  // HTML 轉義
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  }

  function findPositionBySlug(slug) {
    return (window.POSITIONS || []).find(p => p.slug === slug);
  }

  // 依位名查位次（含別名層與門級上下文消歧）
  function findPositionByName(name, fromPos) {
    if (!name) return null;
    if (fromPos && window.POSITION_ALIASES_CONTEXT) {
      const ctx = window.POSITION_ALIASES_CONTEXT[name];
      if (ctx && ctx[fromPos.door]) {
        const cs = window.POSITION_NAME_TO_SLUG.get(ctx[fromPos.door]);
        if (cs) return findPositionBySlug(cs);
      }
    }
    const map = window.POSITION_NAME_TO_SLUG;
    if (map && map.has(name)) return findPositionBySlug(map.get(name));
    return null;
  }

  function findAdjacentPositions(slug, range = 2) {
    const cur = findPositionBySlug(slug);
    if (!cur) return { prev: [], next: [] };
    const sameDoor = (window.POSITIONS || [])
      .filter(p => p.door === cur.door)
      .sort((a, b) => a.position - b.position);
    const idx = sameDoor.findIndex(p => p.slug === slug);
    if (idx < 0) return { prev: [], next: [] };
    return {
      prev: sameDoor.slice(Math.max(0, idx - range), idx),
      next: sameDoor.slice(idx + 1, idx + 1 + range),
    };
  }

  function findLunRecord(position, diceId) {
    if (!position || !position.lun) return null;
    for (const lun of position.lun) {
      if (!lun.dice) continue;
      if (lun.dice === diceId) return lun;
      if (lun.dice.includes(diceId)) return lun;
    }
    return null;
  }

  function isEndgame(slug) {
    if (!slug) return false;
    const p = findPositionBySlug(slug);
    if (!p) return false;
    return p.door === 15 || p.positionName === "圓教究竟妙覺位";
  }

  const CLUSTER_MAP = {
    1: { num: 1, name: "入門定向" }, 2: { num: 1, name: "入門定向" },
    3: { num: 2, name: "六道實相" }, 4: { num: 2, name: "六道實相" }, 5: { num: 2, name: "六道實相" },
    6: { num: 3, name: "入道方便" },
    7: { num: 4, name: "三學修證" }, 8: { num: 4, name: "三學修證" }, 9: { num: 4, name: "三學修證" },
    10: { num: 5, name: "四教位次" }, 11: { num: 5, name: "四教位次" }, 12: { num: 5, name: "四教位次" }, 13: { num: 5, name: "四教位次" },
    14: { num: 6, name: "超越歸趣" }, 15: { num: 6, name: "超越歸趣" },
  };

  function doorAltitude(door) {
    return Math.max(0, Math.min(1, (door - 1) / 14));
  }

  // 中文數字 → 整數（僅一~十，贈掷次數足夠）
  const CN_NUM = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10 };

  // 解析「贈X／贈X擲」：回傳 { bonus, rest }
  //   bonus = 額外擲輪次數（無則 0）
  //   rest  = 剝除贈字記號後的純去向名（可能為空字串＝純贈不移動）
  // 修正舊 bug：須連同「贈X」後可選的「擲」字一併剝除，否則殘「擲」會令去向解析失敗。
  function parseBonus(rawTarget) {
    const raw = (rawTarget || "").trim();
    const m = raw.match(/贈([一二三四五六七八九十])擲?/);
    const bonus = m ? (CN_NUM[m[1]] || 0) : 0;
    // 去括號補述 + 去整個贈記號（含可選「擲」）
    const rest = raw
      .replace(/[（(].*$/, "")
      .replace(/贈[一二三四五六七八九十]擲?/g, "")
      .trim();
    return { bonus, rest };
  }

  // 統一解析某位次某擲相的去向（給遊戲與筆記共用，杜絕靜默吞去向）
  // 回傳：
  //   { found, raw, note, off, bonus, targetName, targetPos, unresolved, mode }
  //   mode: "none"(無此擲相) | "off"(明文不行) | "stay-bonus"(停留+贈擲)
  //       | "move"(移動) | "move-bonus"(移動+贈擲) | "unresolved"(有去向名但查不到)
  function resolveLun(fromPos, diceId) {
    const rec = findLunRecord(fromPos, diceId);
    if (!rec) return { found: false, raw: "", note: "", off: false, bonus: 0,
      targetName: "", targetPos: null, unresolved: false, mode: "none" };

    const raw = rec.target || "";
    const note = rec.note || "";
    if (rec.off) return { found: true, raw, note, off: true, bonus: 0,
      targetName: "", targetPos: null, unresolved: false, mode: "off" };

    const { bonus, rest } = parseBonus(raw);

    // 純贈、無去向名 → 停留原位 + 額外擲
    if (!rest) {
      return { found: true, raw, note, off: false, bonus,
        targetName: "", targetPos: null, unresolved: false,
        mode: bonus ? "stay-bonus" : "off" };
    }

    // 有去向名 → 解析位次
    const targetPos = findPositionByName(rest, fromPos);
    if (!targetPos) {
      // 誠實：查不到就標 unresolved，絕不謊報停留
      return { found: true, raw, note, off: false, bonus,
        targetName: rest, targetPos: null, unresolved: true, mode: "unresolved" };
    }
    return { found: true, raw, note, off: false, bonus,
      targetName: targetPos.positionName, targetPos, unresolved: false,
      mode: bonus ? "move-bonus" : "move" };
  }

  window.ZEN = {
    esc, findPositionBySlug, findPositionByName, findAdjacentPositions,
    findLunRecord, isEndgame, CLUSTER_MAP, doorAltitude,
    parseBonus, resolveLun,
  };
})();
