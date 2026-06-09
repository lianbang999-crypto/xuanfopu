import { useMemo } from 'react';
import layout from '../data/board-layout.gate01.json';
import { POSITIONS, getPos, resolve, tierOf } from '../lib/game.js';
import { convert } from '../lib/convert.js';
import '../styles/gate-board.css';

const posByGateName = new Map(
  POSITIONS.map((p) => [`${p.gateId}:${p.name}`, p])
);

const groupOrder = ['evil', 'mixed-view', 'worldly-good', 'meditation', 'supramundane'];

function moveDir(from, to) {
  if (!from || !to) return 'flat';
  const a = tierOf(from.gateId);
  const b = tierOf(to.gateId);
  if (b < a) return 'up';
  if (b > a) return 'down';
  return 'flat';
}

function pickIdByLayoutName(node) {
  return posByGateName.get(`${layout.gate.id}:${node.name_hant}`)?.id || null;
}

export default function GateBoard({ script, currentId, path = [], last, onPick }) {
  const cv = (s) => convert(s, script, 'hant');
  const current = currentId ? getPos(currentId) : null;
  const currentName = current && current.gateId === layout.gate.id ? current.name : null;
  const artStyle = layout.art?.background
    ? { '--gate-art-bg': `url(${layout.art.background})` }
    : undefined;

  const visited = useMemo(() => {
    const out = new Map();
    path.forEach((step, index) => {
      const p = getPos(step.id);
      if (p?.gateId === layout.gate.id) out.set(p.name, { step: index + 1, dir: step.dir });
    });
    return out;
  }, [path]);

  const prospects = useMemo(() => {
    const out = new Map();
    if (!current || current.gateId !== layout.gate.id || !current.lun) return out;
    current.lun.forEach((lun) => {
      if (lun.off || !lun.target) return;
      const res = resolve(lun.target, current.gateId);
      if (res.kind !== 'move') return;
      const target = getPos(res.id);
      if (!target || target.gateId !== layout.gate.id) return;
      const prev = out.get(target.name) || { count: 0, combos: [], dir: moveDir(current, target) };
      prev.count += 1;
      prev.combos.push(lun.combo);
      out.set(target.name, prev);
    });
    return out;
  }, [current]);

  return (
    <div className="gate-board-wrap" data-gate="1">
      <div className="gate-board-head">
        <div>
          <span className="gate-board-kicker">{cv('門內地圖原型')}</span>
          <h2>{cv(layout.gate.title)}</h2>
          <p>{cv(layout.gate.subtitle)}</p>
        </div>
        <div className="gate-board-state">
          <span>{cv(currentName || '未起手')}</span>
          <em>{cv(last?.kind === 'blocked' ? '不行' : last?.kind === 'move' ? '已行' : '待擲')}</em>
        </div>
      </div>

      <div
        className={`gate-board-canvas ${layout.art?.background ? 'has-art' : ''}`}
        style={artStyle}
        role="img"
        aria-label={cv('第一發始因地門二十一位坐標棋盤')}
      >
        {groupOrder.map((group) => (
          <div key={group} className={`gate-zone z-${group}`} aria-hidden="true">
            <span>{cv(layout.visualGroups[group].label_hant)}</span>
          </div>
        ))}

        {layout.suggestedEdges.map(([from, to], index) => {
          const a = from === 'start-wheel-altar'
            ? layout.landmarks.find((l) => l.id === from)
            : layout.positions.find((p) => p.name_hans === from || p.name_hant === from);
          const b = to === 'start-wheel-altar'
            ? layout.landmarks.find((l) => l.id === to)
            : layout.positions.find((p) => p.name_hans === to || p.name_hant === to);
          if (!a || !b) return null;
          const x1 = a.x * 100;
          const y1 = a.y * 100;
          const x2 = b.x * 100;
          const y2 = b.y * 100;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return (
            <span
              key={`${from}-${to}-${index}`}
              className="gate-edge"
              style={{ left: `${x1}%`, top: `${y1}%`, width: `${len}%`, transform: `rotate(${angle}deg)` }}
            />
          );
        })}

        {layout.landmarks.map((mark) => (
          <button
            key={mark.id}
            type="button"
            className={`gate-landmark ${mark.id}`}
            style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%` }}
            title={cv(mark.description)}
          >
            <span>{mark.id === 'start-wheel-altar' ? '輪' : '上'}</span>
            <b>{cv(mark.name_hant)}</b>
          </button>
        ))}

        {layout.positions.map((node) => {
          const id = pickIdByLayoutName(node);
          const isCurrent = currentName === node.name_hant;
          const wasVisited = visited.get(node.name_hant);
          const future = prospects.get(node.name_hant);
          const state = isCurrent ? 'current' : future ? future.dir : wasVisited ? 'visited' : 'normal';
          return (
            <button
              key={node.name_hant}
              type="button"
              className={`gate-node g-${node.group} s-${state} ${node.nodeSize === 'major' ? 'major' : ''}`}
              style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
              title={cv(`${node.combo_hant || ''} ${node.name_hant}：${node.summary}`)}
              onClick={() => id && onPick?.(id)}
            >
              <span className="combo">{cv(node.combo_hant)}</span>
              <span className="name">{cv(node.name_hant)}</span>
              {wasVisited && !isCurrent && <i className="step">{wasVisited.step}</i>}
              {future && !isCurrent && <i className="future">{future.count}</i>}
            </button>
          );
        })}
      </div>

      <div className="gate-board-legend">
        <span><i className="dot current" />{cv('當前')}</span>
        <span><i className="dot prospect" />{cv('可達')}</span>
        <span><i className="dot visited" />{cv('已歷')}</span>
        <span><i className="dot normal" />{cv('因地位')}</span>
      </div>
    </div>
  );
}
