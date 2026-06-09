import { Fragment, useMemo } from 'react';
import { SUMERU_TIERS, GATES, POSITIONS, getPos, resolve, tierOf } from '../lib/game.js';
import { convert } from '../lib/convert.js';
import '../styles/sumeru-svg-map.css';

const VIEW_W = 420;
const GATE_GAP = 12;
const HEADER_H = 34;
const NODE_W = 74;
const NODE_H = 28;
const PAD_X = 18;
const PAD_TOP = 12;

const BAND_LABEL = {
  buddha: '佛果',
  pure: '淨土橫超',
  sage: '出世聖位',
  practice: '修行法門',
  origin: '因地 · 流弊',
  heaven: '色無色天',
  human: '欲界人天',
  fall: '四種惡趣',
};

const BAND_FILL = {
  buddha: '#fbfaf4',
  pure: '#fbf1ea',
  sage: '#f3f1ec',
  practice: '#eef3eb',
  origin: '#f7efe3',
  heaven: '#eaf1f3',
  human: '#f4eadf',
  fall: '#eee2dc',
};

const gateName = Object.fromEntries(GATES.map((g) => [g.id, g.name]));
const byGate = {};
POSITIONS.forEach((p) => (byGate[p.gateId] ||= []).push(p));

const BIE_SUB = { 0: '十信', 10: '十住', 20: '十行', 30: '十迴向', 40: '十地', 50: '等覺妙覺' };

function isCompactGate(tier, currentGateId, visitedGates, prospectGates, mode) {
  if (mode === 'all') return false;
  if (!currentGateId) return tier.gate !== 1;
  if (tier.gate === currentGateId) return false;
  if (visitedGates.has(tier.gate)) return false;
  if (prospectGates.has(tier.gate)) return false;
  return true;
}

function gateHeight(count, compact, gateId) {
  if (compact) return 66;
  if (gateId === 12) return 260;
  if (count <= 6) return 112;
  if (count <= 10) return 146;
  if (count <= 16) return 178;
  if (count <= 24) return 224;
  return 240;
}

function layoutNodes(positions, gateBox, compact, gateId) {
  if (compact) {
    const maxDots = Math.min(positions.length, 16);
    return positions.slice(0, maxDots).map((p, idx) => ({
      p,
      kind: 'dot',
      x: gateBox.x + 24 + idx * ((gateBox.w - 48) / Math.max(maxDots - 1, 1)),
      y: gateBox.y + 48,
    }));
  }

  const availableW = gateBox.w - PAD_X * 2;
  const cols = gateId === 12 ? 4 : positions.length <= 6 ? 2 : positions.length <= 10 ? 3 : 4;
  const gapX = (availableW - cols * NODE_W) / Math.max(cols - 1, 1);
  const rowGap = gateId === 12 ? 30 : 34;
  const startY = gateBox.y + HEADER_H + PAD_TOP + NODE_H / 2;

  return positions.map((p, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    return {
      p,
      kind: 'node',
      subgroup: gateId === 12 ? BIE_SUB[idx] : null,
      x: gateBox.x + PAD_X + NODE_W / 2 + col * (NODE_W + gapX),
      y: startY + row * rowGap,
    };
  });
}

function moveDir(from, to) {
  if (!from || !to) return 'flat';
  const sourceTier = tierOf(from.gateId);
  const targetTier = tierOf(to.gateId);
  if (targetTier < sourceTier) return 'up';
  if (targetTier > sourceTier) return 'down';
  return 'flat';
}

function compactLabel(name) {
  if (!name) return '';
  return name.length <= 5 ? name : `${name.slice(0, 4)}…`;
}

function SvgHit({ children, onClick, label }) {
  return (
    <g
      className="svg-hit"
      role="button"
      tabIndex="0"
      aria-label={label}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event);
        }
      }}
    >
      {children}
    </g>
  );
}

export default function SumeruSvgMap({ script, currentId, path = [], last, mapMode = 'focus', onPick, onGatePick }) {
  const cv = (s) => convert(s, script, 'hant');
  const current = currentId ? getPos(currentId) : null;
  const currentGateId = current?.gateId || null;

  const visited = useMemo(() => {
    const out = new Map();
    path.forEach((step, index) => out.set(step.id, { step: index + 1, dir: step.dir }));
    return out;
  }, [path]);

  const visitedGates = useMemo(() => {
    const out = new Set();
    path.forEach((step) => {
      const p = getPos(step.id);
      if (p) out.add(p.gateId);
    });
    return out;
  }, [path]);

  const prospects = useMemo(() => {
    const out = new Map();
    if (!current?.lun) return out;
    current.lun.forEach((lun) => {
      if (lun.off || !lun.target) return;
      const res = resolve(lun.target, current.gateId);
      if (res.kind !== 'move') return;
      const target = getPos(res.id);
      if (!target) return;
      const prev = out.get(res.id) || { count: 0, combos: [], dir: moveDir(current, target) };
      prev.count += 1;
      prev.combos.push(lun.combo);
      out.set(res.id, prev);
    });
    return out;
  }, [current]);

  const prospectGates = useMemo(() => {
    const out = new Set();
    prospects.forEach((_, id) => {
      const p = getPos(id);
      if (p) out.add(p.gateId);
    });
    return out;
  }, [prospects]);

  const layout = useMemo(() => {
    let y = 18;
    const gates = [];
    const nodeLookup = new Map();
    let previousBand = null;

    SUMERU_TIERS.forEach((tier) => {
      const positions = byGate[tier.gate] || [];
      const compact = isCompactGate(tier, currentGateId, visitedGates, prospectGates, mapMode);
      const h = gateHeight(positions.length, compact, tier.gate);
      const gateBox = { gateId: tier.gate, band: tier.band, compact, x: 16, y, w: VIEW_W - 32, h, showBand: tier.band !== previousBand, positions };
      previousBand = tier.band;
      const nodes = layoutNodes(positions, gateBox, compact, tier.gate);
      nodes.forEach((n) => nodeLookup.set(n.p.id, n));
      gates.push({ ...gateBox, nodes });
      y += h + GATE_GAP;
    });

    return { gates, nodeLookup, height: y + 24 };
  }, [currentGateId, visitedGates, prospectGates, mapMode]);

  const moveLine = useMemo(() => {
    if (path.length < 2) return null;
    const a = layout.nodeLookup.get(path[path.length - 2].id);
    const b = layout.nodeLookup.get(path[path.length - 1].id);
    if (!a || !b) return null;
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, dir: path[path.length - 1].dir || 'flat' };
  }, [path, layout]);

  const pawnNode = currentId ? layout.nodeLookup.get(currentId) : null;

  return (
    <div className="sumeru-svg-wrap">
      <svg className={`sumeru-svg map-${mapMode} ${current ? 'has-current' : ''}`} viewBox={`0 0 ${VIEW_W} ${layout.height}`} role="img" aria-label={cv('選佛譜十五門二百二十位 SVG 棋盤')}>
        <defs>
          <filter id="sumeruSvgShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2b2926" floodOpacity="0.08" />
          </filter>
          <linearGradient id="sumeruSvgPaper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdfbf5" />
            <stop offset="55%" stopColor="#f7f1e8" />
            <stop offset="100%" stopColor="#efe3d5" />
          </linearGradient>
        </defs>

        <rect className="svg-paper" x="0" y="0" width={VIEW_W} height={layout.height} rx="24" />
        <path className="svg-sumeru-spine" d={`M210 34 C190 ${layout.height * .26}, 232 ${layout.height * .52}, 204 ${layout.height - 48}`} />

        {layout.gates.map((gate) => {
          const isCurrentGate = gate.gateId === currentGateId;
          const isVisitedGate = visitedGates.has(gate.gateId);
          const isProspectGate = prospectGates.has(gate.gateId);
          return (
            <Fragment key={gate.gateId}>
              {gate.showBand && (
                <g className="svg-band-label" transform={`translate(26 ${Math.max(14, gate.y - 4)})`}>
                  <rect width="96" height="22" rx="11" />
                  <text x="48" y="15" textAnchor="middle">{cv(BAND_LABEL[gate.band])}</text>
                </g>
              )}
              <g className={`svg-gate gate-${gate.gateId} band-${gate.band} ${gate.compact ? 'is-compact' : ''} ${isCurrentGate ? 'is-current' : ''} ${isVisitedGate && !isCurrentGate ? 'is-visited' : ''} ${isProspectGate && !isCurrentGate ? 'is-prospect' : ''}`} data-gate={gate.gateId}>
                <rect className="svg-gate-bg" x={gate.x} y={gate.y} width={gate.w} height={gate.h} rx="18" fill={BAND_FILL[gate.band]} />
                <SvgHit label={cv(`${gateName[gate.gateId]}門卡`)} onClick={() => onGatePick?.(gate.gateId)}>
                  <rect className="svg-gate-header" x={gate.x + 10} y={gate.y + 10} width={gate.w - 20} height="28" rx="10" />
                  <text className="svg-gate-title" x={gate.x + 22} y={gate.y + 29}>{cv(`第${gate.gateId}門 · ${gateName[gate.gateId]}`)}</text>
                  <text className="svg-gate-count" x={gate.x + gate.w - 26} y={gate.y + 29} textAnchor="end">{gate.positions.length}位</text>
                </SvgHit>

                {gate.compact ? (
                  <g className="svg-compact-dots">
                    {gate.nodes.map((node) => {
                      const isCurrent = node.p.id === currentId;
                      const future = prospects.get(node.p.id);
                      const wasVisited = visited.get(node.p.id);
                      return (
                        <SvgHit key={node.p.id} label={cv(node.p.name)} onClick={() => onPick?.(node.p.id)}>
                          <circle className={`svg-dot ${isCurrent ? 'is-current' : ''} ${future ? 'is-prospect' : ''} ${wasVisited ? 'is-visited' : ''}`} cx={node.x} cy={node.y} r={isCurrent ? 4.5 : 3.5} />
                        </SvgHit>
                      );
                    })}
                    {gate.positions.length > gate.nodes.length && <text className="svg-more" x={gate.x + gate.w - 28} y={gate.y + 53} textAnchor="end">+{gate.positions.length - gate.nodes.length}</text>}
                  </g>
                ) : (
                  <g className="svg-expanded-nodes">
                    {gate.nodes.map((node) => {
                      const isCurrent = node.p.id === currentId;
                      const future = prospects.get(node.p.id);
                      const wasVisited = visited.get(node.p.id);
                      const state = isCurrent ? 'current' : future ? `prospect ${future.dir}` : wasVisited ? 'visited' : 'normal';
                      return (
                        <Fragment key={node.p.id}>
                          {node.subgroup && (
                            <g className="svg-subgroup" transform={`translate(${gate.x + 22} ${node.y - 22})`}>
                              <rect width="66" height="18" rx="9" />
                              <text x="33" y="13" textAnchor="middle">{cv(node.subgroup)}</text>
                            </g>
                          )}
                          <SvgHit label={cv(node.p.name)} onClick={() => onPick?.(node.p.id)}>
                            <g className={`svg-node ${state}`} data-nid={node.p.id} transform={`translate(${node.x} ${node.y})`}>
                              <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx="10" />
                              <text className="svg-node-name" y="4" textAnchor="middle">{cv(compactLabel(node.p.name))}</text>
                              {wasVisited && !isCurrent && <text className="svg-node-badge" x="31" y="-8" textAnchor="middle">{wasVisited.step}</text>}
                              {future && !isCurrent && <text className="svg-node-badge future" x="31" y="-8" textAnchor="middle">{future.count}</text>}
                            </g>
                          </SvgHit>
                        </Fragment>
                      );
                    })}
                  </g>
                )}
              </g>
            </Fragment>
          );
        })}

        {moveLine && (
          <g className="svg-move-layer">
            <line className="svg-move-line" data-dir={moveLine.dir} x1={moveLine.x1} y1={moveLine.y1} x2={moveLine.x2} y2={moveLine.y2} />
            <circle className="svg-move-end" data-dir={moveLine.dir} cx={moveLine.x2} cy={moveLine.y2} r="5" />
          </g>
        )}

        {pawnNode && (
          <g className={`svg-pawn ${last?.kind === 'blocked' ? 'is-blocked' : ''}`} transform={`translate(${pawnNode.x} ${pawnNode.y - 22})`}>
            <circle r="13" />
            <text y="5" textAnchor="middle">蓮</text>
          </g>
        )}
      </svg>
    </div>
  );
}
