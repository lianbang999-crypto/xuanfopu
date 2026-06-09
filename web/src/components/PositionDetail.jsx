import { getPos } from '../lib/game.js';
import { convert } from '../lib/convert.js';

function kindOf(to) {
  if (!to) return 'off';
  if (/贈/.test(to)) return 'gift';
  if (/(獄|鬼|畜|脩羅|魔)/.test(to)) return 'fall';
  if (/(洲|天|王|仙|梵)/.test(to)) return 'human';
  return 'rise';
}

// 合并相邻同因（target+note+off 相同）的组合，贴近原文「皆…」表述
function mergeLun(lun) {
  const out = [];
  for (const l of lun) {
    const last = out[out.length - 1];
    if (last && last.note === l.note && last.target === l.target && last.off === l.off) {
      last.combos.push(l.combo);
    } else {
      out.push({ combos: [l.combo], target: l.target, note: l.note, off: l.off });
    }
  }
  return out;
}

// 点击地图节点 → 弹窗看该位原文白话 + 升沈缘由
export default function PositionDetail({ id, script, onClose }) {
  const cv = (s) => convert(s, script, 'hant');
  const p = getPos(id);
  if (!p) return null;
  const merged = p.lun ? mergeLun(p.lun) : null;

  return (
    <div className="detail-scrim" onClick={onClose}>
      <div className="detail" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose} aria-label="關閉">×</button>
        <div className="detail-head">
          {p.combo && <span className="gc-combo-badge">{cv(p.combo)}</span>}
          <div className="gc-titles">
            <div className="gc-gate">{cv(p.gateName)}</div>
            <h2 className="gc-name">{cv(p.name)}</h2>
          </div>
          <span className="gc-src">{p.source}</span>
        </div>

        {merged && (
          <div className="detail-lun">
            {merged.map((l, i) => (
              <div key={i} className={`dl-row ${l.off ? 'off' : ''}`} data-kind={kindOf(l.target)}>
                <span className="dl-combo">{l.combos.map((c) => cv(c)).join('·')}</span>
                <span className="dl-to">{l.off ? cv('不行') : cv(l.target)}</span>
                <span className="dl-note">{cv(l.note)}</span>
              </div>
            ))}
          </div>
        )}

        {p.hant && (
          <div className="detail-pu">
            <div className="label">{cv('原文')}</div>
            {p.hant.split('\n').filter((s) => s.trim()).map((s, i) => <p key={i}>{cv(s)}</p>)}
          </div>
        )}
        {p.vern && (
          <div className="detail-pu vern">
            <div className="label">{cv('白話')}</div>
            {p.vern.split('\n').filter((s) => s.trim()).map((s, i) => (
              <p key={i}>{convert(s, script, 'vern')}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
