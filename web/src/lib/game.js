// 选佛谱游戏引擎（demo）
// 机制：六字轮两轮齐掷 → 组合 → 查当前位轮相升降表 → 移动；起手由首掷决定发始因地。
// resolve：把升降表「去向名」解析为目标位次 id（简称/别名归一 + 序号位归别教 + 同门消歧）。
import data from '../data/xuanfopu.json';

export const LUN = ['那', '謨', '阿', '彌', '陀', '佛']; // 顺次右旋六字
const ORD = { 初: 1, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

// ---------- 位次索引 ----------
const POS_BY_ID = {};
const POS_BY_NAME = {};
export const GATES = data.gates.map((g) => ({ id: g.id, name: g.name_hant, count: g.count }));

// 须弥山升沉立图：门从顶（佛果）到底（地狱）的垂直层序 + 色带
export const SUMERU_TIERS = [
  { gate: 15, band: 'buddha' },   // 圆极果位·佛
  { gate: 14, band: 'pure' },     // 净土横超
  { gate: 13, band: 'sage' },     // 圆教位次
  { gate: 12, band: 'sage' },     // 别教位次
  { gate: 11, band: 'sage' },     // 通教位次
  { gate: 10, band: 'sage' },     // 藏教位次
  { gate: 9, band: 'practice' },  // 增上慧学
  { gate: 8, band: 'practice' },  // 增上定学
  { gate: 7, band: 'practice' },  // 增上戒学
  { gate: 6, band: 'practice' },  // 生善灭恶
  { gate: 1, band: 'origin' },    // 发始因地（起手平台）
  { gate: 2, band: 'origin' },    // 法道流弊
  { gate: 5, band: 'heaven' },    // 色无色天
  { gate: 4, band: 'human' },     // 欲界人天
  { gate: 3, band: 'fall' },      // 四种恶趣·地狱
];
const _TIER = {}, _BAND = {};
SUMERU_TIERS.forEach((t, i) => { _TIER[t.gate] = i; _BAND[t.gate] = t.band; });
export const tierOf = (gateId) => (_TIER[gateId] ?? -1); // 越小越高（顶=0，底=14）
export const bandOf = (gateId) => (_BAND[gateId] || 'origin');
data.gates.forEach((g) => g.positions.forEach((p) => {
  const rec = {
    id: p.id, name: p.name_hant, combo: p.combo,
    gateId: g.id, gateName: g.name_hant,
    transitions: p.transitions, lun: p.lun, source: p.source,
    hant: p.pu_hant, vern: p.pu_vern,
  };
  POS_BY_ID[p.id] = rec;
  (POS_BY_NAME[p.name_hant] ||= []).push(rec);
}));
export const getPos = (id) => POS_BY_ID[id];
export const POSITIONS = Object.values(POS_BY_ID);
export const FIRST_POSITIONS = data.gates[0].positions.map((p) => ({ id: p.id, name: p.name_hant, combo: p.combo }));

// 别教十信/住/行/向/地（按序号取位），供「X住」「七地」等序号去向归一
const g12 = data.gates[11].positions;
const BIE = { 心: g12.slice(0, 10), 住: g12.slice(10, 20), 行: g12.slice(20, 30), 向: g12.slice(30, 40), 地: g12.slice(40, 50) };

// 去向别名/简称 → 标准位次名
const ALIAS = {
  // 四种恶趣
  無間獄: '無間地獄', 阿鼻獄: '阿鼻地獄', 有間獄: '有間地獄',
  中品畜: '中品畜生', 上品畜: '上品畜生', 下品畜: '下品畜生',
  // 欲界人天
  南洲: '南贍部洲', 東洲: '東勝神洲', 西洲: '西牛貨洲', 北洲: '北俱盧洲',
  鐵輪: '鐵輪王', 金輪: '金輪王', 銅輪: '銅輪王', 銀輪: '銀輪王',
  忉利: '忉利天', 夜摩: '夜摩天', 他化天: '他化自在天', 魔天: '魔羅天',
  四王: '四王天', 四天王: '四王天', 內院: '彌勒內院', 十仙: '十種仙',
  // 色无色天
  大梵: '大梵天', 梵眾: '梵眾天', 梵輔: '梵輔天', 少光: '少光天',
  無量光: '無量光天', 光音: '光音天', 少淨: '少淨天', 無量淨: '無量淨天',
  徧淨: '徧淨天', 福生: '福生天', 福愛: '福愛天', 廣果: '廣果天',
  空處: '空無邊處天', 空處天: '空無邊處天', 識處: '識無邊處天',
  無所有: '無所有處天', 無所有處: '無所有處天',
  非非想: '非想非非想處天', 非非想處: '非想非非想處天',
  鈍那含: '鈍根阿那含', 鈍根那含: '鈍根阿那含', 善見: '善見天', 善現: '善現天',
  // 生善灭恶
  聽法: '聽法雜眾', 護法: '護法八部', 八部: '護法八部',
  請法: '請法梵王', 亦請法: '請法梵王', 作法: '作法懺',
  // 增上戒学
  五戒: '在家五戒', 八戒: '八關齋戒', 八關戒: '八關齋戒', 八關戒齋: '八關齋戒',
  十戒: '沙彌十戒', 持比丘: '持比丘律', 持二部: '持二部律', 廣持: '廣持毗尼',
  住毗尼: '住毗尼而不動', 善滅諍: '善能滅諍',
  業清淨: '業清淨戒', 餘清淨: '餘清淨戒', 覺清淨: '覺清淨戒', 覺淨戒: '覺清淨戒',
  念清淨: '念清淨戒', 無上道: '無上道戒',
  // 增上定学
  六妙門: '六妙門禪', 八背捨: '八背捨觀', 八勝處: '八勝處觀',
  十一切處: '十一切處觀', 十一切: '十一切處觀', 九次第: '九次第定',
  師子奮迅: '師子奮迅三昧', 師子: '師子奮迅三昧', 超越: '超越三昧',
  // 增上慧学
  聲聞心: '發聲聞心', 支佛心: '發辟支佛心', 辟支心: '發辟支佛心', 辟支佛心: '發辟支佛心',
  事度心: '事六度心', 次第觀: '次第三觀', 圓頓觀: '圓頓妙觀', 求淨土: '求生淨土',
  // 藏教位次
  世第一: '世第一位', 初果: '初果須陀洹', 二果: '二果斯陀含', 三果: '三果阿那含', 四果: '四果阿羅漢',
  初僧祇: '大乘初阿僧祇滿', 二僧祇: '二阿僧祇滿', 三僧祇: '三阿僧祇滿',
  二僧祇滿: '二阿僧祇滿', 三僧祇滿: '三阿僧祇滿', 藏佛果: '藏教佛果',
  辟支佛果: '中乘辟支佛果', 支佛果: '中乘辟支佛果', 辟支果: '中乘辟支佛果', 辟支佛: '中乘辟支佛果',
  // 通教位次（去序号）
  乾慧地: '初乾慧地', 性地: '二性地', 八人地: '三八人地', 見地: '四見地', 薄地: '五薄地',
  離欲地: '六離欲地', 離欲: '六離欲地', 已辦地: '七已辦地',
  辟支佛地: '八辟支佛地', 支佛地: '八辟支佛地', 菩薩地: '九菩薩地',
  佛地: '十佛地', 通佛地: '十佛地', 通教佛地: '十佛地',
  // 圆教位次
  圓五品: '圓五品位', 圓信: '圓十信位', 圓十信: '圓十信位',
  圓住: '圓十住位', 圓十住: '圓十住位', 圓行: '圓十行位', 圓十行: '圓十行位',
  圓向: '圓十迴向位', 圓十向: '圓十迴向位', 圓十迴向: '圓十迴向位',
  圓地: '圓十地位', 圓十地: '圓十地位', 圓等覺: '圓等覺位', 金剛心: '金剛後心',
  // 净土横超
  疑城: '淨土疑城', 下下生: '下品下生', 下中生: '下品中生', 下上生: '下品上生',
  中下生: '中品下生', 中中生: '中品中生', 中上生: '中品上生',
  上下生: '上品下生', 上中生: '上品中生', 上上生: '上品上生',
  方便淨土: '方便有餘淨土', 方便淨: '方便有餘淨土', 方便土: '方便有餘淨土', 方便: '方便有餘淨土',
  實報淨土: '實報莊嚴淨土', 實報淨: '實報莊嚴淨土',
  寂光淨土: '常寂光淨土', 寂光淨: '常寂光淨土',
  // 别教（具名别名）
  發心住: '初發心住', 灌頂住: '十灌頂住', 治地住: '二治地住', 修行住: '三修行住', 生貴住: '四生貴住',
  歡喜地: '初歡喜地', 法雲地: '十法雲地', 發光地: '三發光地', 燄慧地: '四燄慧地', 難勝地: '五難勝地',
  現前地: '六現前地', 遠行地: '七遠行地', 不動地: '八不動地', 善慧地: '九善慧地',
  歡喜行: '初歡喜行', 真實行: '十真實行', 法界向: '十法界無量迴向', 初救護向: '初救護眾生離眾生相迴向',
  等覺: '等覺菩薩', 別等覺: '等覺菩薩', 別妙覺: '別教妙覺佛位', 別妙覺佛: '別教妙覺佛位',
  護法心: '七護法心', 迴向心: '八迴向心', 精進心: '三精進心', 不退心: '六不退心',
  // 发始因地门简称
  出世福: '出世福業', 出世戒: '出世戒學', 出世定: '出世定學', 出世慧: '出世慧學',
  上十惡: '上品十惡', 中十惡: '中品十惡', 下十惡: '下品十惡',
  上品惡: '上品十惡', 中品惡: '中品十惡', 下品惡: '下品十惡',
  // 补遗 / 异体
  空無邊處: '空無邊處天', 識無邊處: '識無邊處天', 無想: '無想天',
  通菩薩地: '九菩薩地', 南瞻部洲: '南贍部洲', 不退住: '七不退住', 十迴向: '十法界無量迴向',
  內院行那佛: '彌勒內院', 內院行謨佛: '彌勒內院', 內院行阿佛: '彌勒內院', 內院行彌佛: '彌勒內院',
  寂光上上: '常寂光淨土', 寂光上上品: '常寂光淨土', 實報上上品: '實報莊嚴淨土',
};

// 去向 → 解析结果
export function resolve(to, fromGateId) {
  if (!to) return { kind: 'unresolved', raw: to };
  const giftM = to.match(/贈([一二三四])/);
  if (giftM) return { kind: 'gift', n: ORD[giftM[1]], raw: to };
  if (/究竟妙覺|^圓妙覺$/.test(to) || to === '佛') return { kind: 'win', raw: to };
  const name = ALIAS[to] || to;
  // 序号位（X住/行/向/地/心，无圆/别前缀）→ 别教对应位
  const m = name.match(/^別?([初一二三四五六七八九十])(住|行|向|地|心)$/);
  if (m && !POS_BY_NAME[name]) {
    const arr = BIE[m[2]];
    const p = arr && arr[ORD[m[1]] - 1];
    if (p) return mv(POS_BY_ID[p.id]);
  }
  const cands = POS_BY_NAME[name];
  if (cands && cands.length) {
    const same = cands.find((c) => c.gateId === fromGateId);
    return mv(same || cands[0]);
  }
  return { kind: 'unresolved', raw: to };
}
function mv(p) { return { kind: 'move', id: p.id, name: p.name, gateId: p.gateId, gateName: p.gateName, raw: p.name }; }

// 掷轮 → 组合（两字按那谟阿弥陀佛顺序，无序）
export function roll() {
  const a = Math.floor(Math.random() * 6);
  const b = Math.floor(Math.random() * 6);
  const [x, y] = [a, b].sort((m, n) => m - n);
  return { dice: [LUN[a], LUN[b]], combo: LUN[x] + LUN[y] };
}

// 起手：首掷组合 → 发始因地门对应位
export function startPosition(combo) {
  const p = data.gates[0].positions.find((x) => x.combo === combo);
  return p ? POS_BY_ID[p.id] : null;
}

// 行棋一步：优先用手工校订 lun（含行/不行 + 原文原因），回退到 transitions
export function step(posId, combo) {
  const pos = POS_BY_ID[posId];
  const L = pos.lun && pos.lun.find((l) => l.combo === combo);
  if (L) {
    if (L.off || !L.target) return { kind: 'blocked', combo, note: L.note || '' };
    return { ...resolve(L.target, pos.gateId), to: L.target, combo, note: L.note || '' };
  }
  const t = pos.transitions.find((tr) => tr.combos.includes(combo));
  if (!t) return { kind: 'blocked', combo, note: '' };
  return { ...resolve(t.to, pos.gateId), to: t.to, combo, note: '' };
}
