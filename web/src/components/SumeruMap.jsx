import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { SUMERU_TIERS, GATES, POSITIONS, getPos, resolve, tierOf } from '../lib/game.js';
import { convert } from '../lib/convert.js';

const byGate = {};
POSITIONS.forEach((p) => (byGate[p.gateId] ||= []).push(p));
const gateName = {};
GATES.forEach((g) => (gateName[g.id] = g.name));

// 色带 → 大层次名（分段标）
const BAND_LABEL = {
  buddha: '佛果', pure: '淨土橫超', sage: '出世聖位', practice: '修行法門',
  origin: '因地 · 流弊', heaven: '色無色天', human: '欲界人天', fall: '四種惡趣',
};

// 别教 52 位子分组（在该序号位次前插入小标）
const BIE_SUB = { 0: '十 信', 10: '十 住', 20: '十 行', 30: '十 迴 向', 40: '十 地', 50: '等覺 · 妙覺' };

function moveDir(from, to) {
  if (!from || !to) return 'flat';
  const a = tierOf(from.gateId);
  const b = tierOf(to.gateId);
  if (b < a) return 'up';
  if (b > a) return 'down';
  return 'flat';
}

function nodeCenter(root, node) {
  const rootRect = root.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  return {
    x: nodeRect.left + nodeRect.width / 2 - rootRect.left,
    y: nodeRect.top + nodeRect.height / 2 - rootRect.top,
  };
}

// 须弥山升沉立图：门自顶（佛）至底（地狱）竖向铺陈，棋子与轨迹随行棋升沈
export default function SumeruMap({ script, currentId, path = [], last, mapMode = 'focus', onPick }) {
  const cv = (s) => convert(s, script, 'hant');
  const curRef = useRef(null);
  const sumeruRef = useRef(null);
  const pawnFrame = useRef(null);
  const pawnTimer = useRef(null);
  const previousCurrentId = useRef(null);
  const [line, setLine] = useState(null);
  const [pawn, setPawn] = useState(null);
  const [pawnMoving, setPawnMoving] = useState(false);
  const [blockedPulse, setBlockedPulse] = useState(false);
  const current = currentId ? getPos(currentId) : null;
  const currentGateId = current ? current.gateId : null;

  useEffect(() => {
    if (curRef.current) curRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentId]);

  useEffect(() => {
    const root = sumeruRef.current;
    if (!root || !currentId) {
      setPawn(null);
      previousCurrentId.current = currentId;
      return undefined;
    }

    const updatePawn = (animate = false) => {
      const to = root.querySelector(`[data-nid="${currentId}"]`);
      if (!to) return;
      const target = nodeCenter(root, to);
      const prevId = path.length >= 2 ? path[path.length - 2].id : null;
      const from = prevId ? root.querySelector(`[data-nid="${prevId}"]`) : null;
      const dir = path[path.length - 1]?.dir || 'start';
      const shouldAnimate = animate && from && prevId !== currentId;

      clearTimeout(pawnTimer.current);
      cancelAnimationFrame(pawnFrame.current);
      if (shouldAnimate) {
        setPawn({ ...nodeCenter(root, from), dir });
        setPawnMoving(true);
        pawnFrame.current = requestAnimationFrame(() => {
          pawnFrame.current = requestAnimationFrame(() => setPawn({ ...target, dir }));
        });
        pawnTimer.current = setTimeout(() => setPawnMoving(false), 900);
      } else {
        setPawn({ ...target, dir });
        setPawnMoving(false);
      }
    };

    updatePawn(previousCurrentId.current && previousCurrentId.current !== currentId);
    previousCurrentId.current = currentId;

    const onResize = () => updatePawn(false);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(root);
    window.addEventListener('resize', onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
      clearTimeout(pawnTimer.current);
      cancelAnimationFrame(pawnFrame.current);
    };
  }, [currentId, path, mapMode]);

  useEffect(() => {
    if (last?.kind !== 'blocked') return undefined;
    setBlockedPulse(false);
    const frame = requestAnimationFrame(() => setBlockedPulse(true));
    const timer = setTimeout(() => setBlockedPulse(false), 620);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [last]);

  // 最近一步移动轨迹线（上一位 → 当前位）；随布局变化重算，避免响应式或滚动后错位。
  useEffect(() => {
    const root = sumeruRef.current;
    if (path.length < 2 || !root) { setLine(null); return undefined; }
    const updateLine = () => {
      const from = root.querySelector(`[data-nid="${path[path.length - 2].id}"]`);
      const to = root.querySelector(`[data-nid="${path[path.length - 1].id}"]`);
      if (!from || !to) { setLine(null); return; }
      const r0 = root.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      setLine({
        x1: a.left + a.width / 2 - r0.left, y1: a.top + a.height / 2 - r0.top,
        x2: b.left + b.width / 2 - r0.left, y2: b.top + b.height / 2 - r0.top,
        dir: path[path.length - 1].dir || 'flat',
      });
    };
    updateLine();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateLine) : null;
    ro?.observe(root);
    window.addEventListener('resize', updateLine);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateLine);
    };
  }, [path]);

  // 走过的位次 → {step, dir}
  const visited = {};
  path.forEach((p, i) => { visited[p.id] = { step: i + 1, dir: p.dir }; });
  const visitedGates = useMemo(() => {
    const ids = new Set();
    path.forEach((p) => {
      const pos = getPos(p.id);
      if (pos) ids.add(pos.gateId);
    });
    return ids;
  }, [path]);
  const prospects = useMemo(() => {
    const out = new Map();
    if (!current || !current.lun) return out;
    current.lun.forEach((l) => {
      if (l.off || !l.target) return;
      const res = resolve(l.target, current.gateId);
      if (res.kind !== 'move') return;
      const target = getPos(res.id);
      if (!target) return;
      const prev = out.get(res.id) || { count: 0, combos: [], dir: moveDir(current, target) };
      prev.count += 1;
      prev.combos.push(l.combo);
      out.set(res.id, prev);
    });
    return out;
  }, [current]);
  const prospectGates = useMemo(() => {
    const ids = new Set();
    prospects.forEach((_, id) => {
      const pos = getPos(id);
      if (pos) ids.add(pos.gateId);
    });
    return ids;
  }, [prospects]);

  let prevBand = null;
  return (
    <div className={`sumeru ${current ? 'has-current' : ''} map-${mapMode}`} ref={sumeruRef}>
      <svg className="move-line-layer">
        {line && (
          <g>
            <line className="move-line" data-dir={line.dir} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
            <circle className="move-line-end" data-dir={line.dir} cx={line.x2} cy={line.y2} r="5" />
          </g>
        )}
      </svg>
      {pawn && current && (
        <div
          className={`board-pawn ${pawnMoving ? 'is-moving' : ''} ${blockedPulse ? 'is-blocked' : ''}`}
          data-dir={pawn.dir}
          style={{ left: `${pawn.x}px`, top: `${pawn.y}px` }}
          aria-hidden="true"
        >
          <span>蓮</span>
        </div>
      )}
      {SUMERU_TIERS.map((tier) => {
        const band = tier.band;
        const showDivider = band !== prevBand;
        const tierCurrent = tier.gate === currentGateId;
        const tierVisited = visitedGates.has(tier.gate);
        const tierProspect = prospectGates.has(tier.gate);
        const tierFolded = current && mapMode === 'focus' && !tierCurrent && !tierVisited && !tierProspect;
        prevBand = band;
        return (
          <div key={tier.gate} className={`tier-wrap ${tierFolded ? 'focus-folded' : ''}`}>
            {showDivider && (
              <div className="band-divider" data-band={band}>
                <span>{cv(BAND_LABEL[band])}</span>
              </div>
            )}
            <section
              className={`tier ${tierCurrent ? 'current-tier' : ''} ${tierVisited && !tierCurrent ? 'visited-tier' : ''}`}
              data-band={band}
            >
              <div className="tier-name">
                <span className="tier-no">{tier.gate}</span>
                {cv(gateName[tier.gate])}
              </div>
              <div className="tier-nodes">
                {(byGate[tier.gate] || []).map((p, idx) => {
                  const cur = p.id === currentId;
                  const v = visited[p.id];
                  const future = prospects.get(p.id);
                  return (
                    <Fragment key={p.id}>
                      {tier.gate === 12 && BIE_SUB[idx] && <div className="node-subgroup">{cv(BIE_SUB[idx])}</div>}
                      <button
                        ref={cur ? curRef : null}
                        className={`node ${cur ? 'current' : ''} ${cur && pawnMoving ? 'landing' : ''} ${cur && blockedPulse ? 'blocked-bump' : ''} ${v && !cur ? 'visited' : ''} ${future && !cur ? 'prospect' : ''}`}
                        data-nid={p.id}
                        data-band={band}
                        data-dir={v ? v.dir : undefined}
                        data-future-dir={future ? future.dir : undefined}
                        onClick={() => onPick(p.id)}
                        title={future ? `${cv(p.name)} · ${future.combos.map((c) => cv(c)).join('、')}` : cv(p.name)}
                      >
                        <span className="node-name">{cv(p.name)}</span>
                        {v && !cur && <span className="node-step">{v.step}</span>}
                        {future && !cur && <span className="node-prospect">{future.count}</span>}
                      </button>
                    </Fragment>
                  );
                })}
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
