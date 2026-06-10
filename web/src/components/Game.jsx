import { useState, useEffect, useRef } from 'react';
import { roll, startPosition, step, getPos, tierOf, bandOf, resolve } from '../lib/game.js';
import { convert } from '../lib/convert.js';
import SumeruMap from './SumeruMap.jsx';
import GateBoard from './GateBoard.jsx';
import SumeruSvgMap from './SumeruSvgMap.jsx';
import GateCardModal from './GateCardModal.jsx';
import PositionDetail from './PositionDetail.jsx';

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

const MOVE_LABEL = {
  up: '佛法勝進',
  human: '人天升降',
  down: '下降',
  flat: '輪轉',
  blocked: '不行',
  gift: '特殊動作',
  win: '終局',
  pending: '待核',
};
const MOVE_ORDER = ['up', 'human', 'down', 'flat', 'blocked', 'gift', 'win', 'pending'];
const REALM_GATES = new Set([3, 4, 5]);

function movementKind(pos, lun) {
  if (!pos || !lun || lun.off || !lun.target) return 'blocked';
  const res = resolve(lun.target, pos.gateId);
  if (res.kind === 'gift') return 'gift';
  if (res.kind === 'win') return 'win';
  if (res.kind !== 'move') return 'pending';
  const target = getPos(res.id);
  if (!target) return 'pending';
  const sourceTier = tierOf(pos.gateId);
  const targetTier = tierOf(target.gateId);
  if (sourceTier !== targetTier && (REALM_GATES.has(pos.gateId) || REALM_GATES.has(target.gateId))) return 'human';
  if (targetTier < sourceTier) return 'up';
  if (targetTier > sourceTier) return 'down';
  return 'flat';
}

function summarizeLun(pos) {
  const counts = {};
  if (!pos || !pos.lun) return [];
  pos.lun.forEach((lun) => {
    const key = movementKind(pos, lun);
    counts[key] = (counts[key] || 0) + 1;
  });
  return MOVE_ORDER.filter((key) => counts[key]).map((key) => ({ key, label: MOVE_LABEL[key], count: counts[key] }));
}

function lastMoveLabel(last) {
  if (!last) return '靜候';
  if (last.kind === 'start') return '起手';
  if (last.kind === 'move') return last.dir === 'up' ? MOVE_LABEL.up : last.dir === 'down' ? MOVE_LABEL.down : MOVE_LABEL.flat;
  if (last.kind === 'gift') return MOVE_LABEL.gift;
  if (last.kind === 'win') return MOVE_LABEL.win;
  if (last.kind === 'blocked') return MOVE_LABEL.blocked;
  return MOVE_LABEL.pending;
}

function JourneyStatus({ pos, path, last, cv, mapMode, setMapMode }) {
  const band = pos ? bandOf(pos.gateId) : 'origin';
  return (
    <div className="journey-status" data-band={band} aria-live="polite">
      <div className="journey-mark">
        <span className="journey-dot" />
        <span>{cv(pos ? '當前位置' : '行棋未起')}</span>
      </div>
      <div className="journey-main">
        <strong>{cv(pos ? pos.name : '未起手')}</strong>
        <span>{cv(pos ? pos.gateName : '發始因地門')}</span>
      </div>
      <div className="journey-meta">
        <span>{cv(BAND_LABEL[band])}</span>
        <span>{cv('行棋')} · {path.length || 0}</span>
        <span>{cv(lastMoveLabel(last))}</span>
      </div>
      <div className="map-mode" role="group" aria-label={cv('地圖模式')}>
        <button
          className={mapMode === 'focus' ? 'active' : ''}
          disabled={!pos}
          onClick={() => setMapMode('focus')}
        >
          {cv('聚焦')}
        </button>
        <button
          className={mapMode === 'all' ? 'active' : ''}
          onClick={() => setMapMode('all')}
        >
          {cv('全圖')}
        </button>
      </div>
    </div>
  );
}

function MoveCompass({ pos, cv }) {
  const rows = summarizeLun(pos);
  return (
    <div className={`move-compass ${pos ? '' : 'is-empty'}`}>
      <div className="compass-head">
        <span>{cv('本位輪相')}</span>
        <em>{pos ? cv('二十一輪') : cv('未起手')}</em>
      </div>
      {rows.length ? (
        <div className="compass-chips">
          {rows.map((row) => (
            <span key={row.key} className="compass-chip" data-kind={row.key}>
              <b>{cv(row.label)}</b>
              <i>{row.count}</i>
            </span>
          ))}
        </div>
      ) : (
        <div className="compass-empty">{cv('尚未入局')}</div>
      )}
    </div>
  );
}

function MobileRollDock({ pos, dice, last, won, rolling, doRoll, reset, cv }) {
  return (
    <div className="mobile-roll-dock">
      <div className="dock-result">
        <span>{cv(dice ? dice.combo : '未擲')}</span>
        <strong>{cv(pos ? pos.name : '未起手')}</strong>
        <em>{cv(lastMoveLabel(last))}</em>
      </div>
      {!won ? (
        <button className="dock-roll" onClick={doRoll} disabled={rolling}>
          {cv(rolling ? '擲行中' : pos ? '擲輪' : '起手')}
        </button>
      ) : (
        <div className="dock-won">{cv('成佛')}</div>
      )}
      <button className="dock-reset" onClick={reset}>{cv('重開')}</button>
    </div>
  );
}

// 原文：“輪如占察輪相。而作六面。以那謨阿彌陀佛六字。順次右旋。刻於六面。”
const DICE_FACE_META = {
  那: '那 · 見',
  謨: '謨 · 愛',
  阿: '阿 · 施',
  彌: '彌 · 戒',
  陀: '陀 · 定',
  佛: '佛 · 慧',
};
const DICE_CHARS = ['那', '謨', '阿', '彌', '陀', '佛'];
const DICE_FACE_CLASSES = ['front', 'back', 'right', 'left', 'top', 'bottom'];
const ROLL_TICK_MS = 82;
const ROLL_REVEAL_MS = 880;
const ROLL_SETTLE_MS = 1180;

function diceCombo(a, b) {
  return [a, b].sort((x, y) => DICE_CHARS.indexOf(x) - DICE_CHARS.indexOf(y)).join('');
}

function randomDiceDisplay() {
  const a = DICE_CHARS[Math.floor(Math.random() * 6)];
  const b = DICE_CHARS[Math.floor(Math.random() * 6)];
  return { dice: [a, b], combo: diceCombo(a, b) };
}

function ZhanchaWheel({ char, rollKey, cv, rolling, delay = 0 }) {
  const label = DICE_FACE_META[char] || DICE_FACE_META.那;
  const faceChars = [char, ...DICE_CHARS.filter((diceChar) => diceChar !== char)];

  return (
    <div
      className={`zhancha-stage ${rolling ? 'is-rolling' : ''}`}
      title={cv('輪如占察輪相。而作六面。順次右旋。')}
      aria-label={cv(`六字骰子：${label}`)}
      style={{ '--roll-delay': `${delay}ms` }}
    >
      <div className="zhancha-shadow" />
      <div key={`${char}-${rollKey}`} className={`zhancha-wheel-image ${rollKey ? 'rolling' : ''}`}>
        <div className="zhancha-dice-cube">
          {faceChars.map((diceChar, index) => (
            <span key={`${DICE_FACE_CLASSES[index]}-${diceChar}`} className={`zhancha-dice-face ${DICE_FACE_CLASSES[index]}`}>
              <b>{cv(diceChar)}</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 升沉折线图：横轴掷数、纵轴三界高度（佛顶狱底），升金降墨，直观见「往还之疲苦」
function SinkRiseChart({ path, cv }) {
  if (!path || path.length < 2) return null;
  const pts = path.map((p, i) => ({ i, tier: tierOf(getPos(p.id).gateId), dir: p.dir }));
  const W = 296, H = 96, n = pts.length, pad = 9;
  const X = (i) => (n <= 1 ? W / 2 : pad + (i / (n - 1)) * (W - 2 * pad));
  const Y = (tier) => pad + (tier / 14) * (H - 2 * pad);
  return (
    <div className="sink-rise-wrap">
      <div className="sr-title">{cv('升沈軌跡')}</div>
      <svg className="sink-rise" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line className="sr-grid" x1={0} y1={Y(0)} x2={W} y2={Y(0)} />
        <line className="sr-grid" x1={0} y1={Y(14)} x2={W} y2={Y(14)} />
        {pts.slice(1).map((p, i) => {
          const a = pts[i];
          const cls = p.dir === 'up' ? 'up' : p.dir === 'down' ? 'down' : 'flat';
          return <line key={i} className={`sr-seg ${cls}`} x1={X(a.i)} y1={Y(a.tier)} x2={X(p.i)} y2={Y(p.tier)} />;
        })}
        {pts.map((p, i) => (
          <circle key={i} className={`sr-dot ${i === n - 1 ? 'cur' : ''}`} cx={X(p.i)} cy={Y(p.tier)} r={i === n - 1 ? 4 : 2.4} />
        ))}
      </svg>
      <div className="sr-axis"><span>{cv('佛')}</span><span>{cv('獄')}</span></div>
    </div>
  );
}

export default function Game({ script }) {
  const cv = (s) => convert(s, script, 'hant');
  const [pos, setPos] = useState(null);
  const [path, setPath] = useState([]);     // 升沉轨迹 [{id, dir}]
  const [dice, setDice] = useState(null);
  const [last, setLast] = useState(null);
  const [log, setLog] = useState([]);
  const [gift, setGift] = useState(0);
  const [won, setWon] = useState(false);
  const [picked, setPicked] = useState(null);
  const [pickedGate, setPickedGate] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [visibleDice, setVisibleDice] = useState(null);
  const [rollKey, setRollKey] = useState(0);
  const [mapMode, setMapMode] = useState('focus');
  const [boardView, setBoardView] = useState('svg');
  const rollTimers = useRef([]);

  function pushLog(combo, text, kind) {
    setLog((L) => [{ combo, text, kind }, ...L].slice(0, 40));
  }

  function clearRollTimers() {
    rollTimers.current.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    rollTimers.current = [];
  }

  useEffect(() => clearRollTimers, []);

  function settleRoll(r) {
    setDice(r);
    setVisibleDice(r);
    if (!pos) {
      const sp = startPosition(r.combo);
      setPos(sp);
      setPath([{ id: sp.id, dir: 'start' }]);
      setLast({ kind: 'start', name: sp.name, gateName: sp.gateName });
      pushLog(r.combo, `起手 · ${sp.gateName}「${sp.name}」`, 'start');
      setRolling(false);
      return;
    }
    const res = step(pos.id, r.combo);
    if (res.kind === 'move') {
      const np = getPos(res.id);
      const dir = tierOf(np.gateId) < tierOf(pos.gateId) ? 'up'
        : tierOf(np.gateId) > tierOf(pos.gateId) ? 'down' : 'flat';
      setPos(np);
      setPath((P) => [...P, { id: res.id, dir }]);
      setLast({ ...res, dir });
      pushLog(r.combo, `${res.to} → ${np.gateName}「${np.name}」`, dir === 'down' ? 'fall' : 'move');
    } else if (res.kind === 'win') {
      setWon(true);
      setLast(res);
      pushLog(r.combo, `${res.to} · 圓極果位「佛」`, 'win');
    } else if (res.kind === 'gift') {
      setGift((g) => g + res.n);
      setLast(res);
      pushLog(r.combo, `${res.to} · 得赠掷 ${res.n}`, 'gift');
    } else if (res.kind === 'blocked') {
      setLast(res);
      pushLog(r.combo, '不行 · 停步', 'blocked');
    } else {
      setLast(res);
      pushLog(r.combo, `${res.raw} · 去向待核`, 'unresolved');
    }
    setRolling(false);
  }

  function doRoll() {
    if (won || rolling) return;
    clearRollTimers();
    const r = roll();
    setRolling(true);
    setLast(null);
    setVisibleDice(randomDiceDisplay());
    setRollKey((k) => k + 1);

    const tick = setInterval(() => {
      setVisibleDice(randomDiceDisplay());
    }, ROLL_TICK_MS);
    const reveal = setTimeout(() => {
      clearInterval(tick);
      setVisibleDice(r);
      setRollKey((k) => k + 1);
    }, ROLL_REVEAL_MS);
    const settle = setTimeout(() => {
      clearRollTimers();
      settleRoll(r);
    }, ROLL_SETTLE_MS);
    rollTimers.current = [tick, reveal, settle];
  }

  function reset() {
    clearRollTimers();
    setPos(null); setPath([]); setDice(null); setVisibleDice(null); setLast(null); setLog([]); setGift(0); setWon(false); setPicked(null); setPickedGate(null); setRolling(false);
  }

  const shownDice = visibleDice || dice;
  const showGateBoard = boardView === 'gate' && (!pos || pos.gateId === 1);

  return (
    <main className="game-sumeru">
      <section className="sumeru-stage">
        <JourneyStatus pos={pos} path={path} last={last} cv={cv} mapMode={mapMode} setMapMode={setMapMode} />
        <div className="map-mode board-view-switch" role="group" aria-label={cv('棋盤樣式')}>
          <button className={boardView === 'classic' ? 'active' : ''} onClick={() => setBoardView('classic')}>{cv('原圖')}</button>
          <button className={boardView === 'gate' ? 'active' : ''} onClick={() => setBoardView('gate')}>{cv('門圖')}</button>
          <button className={boardView === 'svg' ? 'active' : ''} onClick={() => setBoardView('svg')}>{cv('SVG')}</button>
        </div>
        <div className="sumeru-scroll">
          {boardView === 'svg' ? (
            <SumeruSvgMap script={script} currentId={pos ? pos.id : null} path={path} last={last} mapMode={mapMode} onPick={setPicked} onGatePick={setPickedGate} />
          ) : showGateBoard ? (
            <GateBoard script={script} currentId={pos ? pos.id : null} path={path} last={last} onPick={setPicked} />
          ) : (
            <SumeruMap script={script} currentId={pos ? pos.id : null} path={path} last={last} mapMode={mapMode} onPick={setPicked} />
          )}
        </div>
      </section>

      <aside className="game-panel">
        <div className={`dice-area ${rolling ? 'is-rolling' : ''}`}>
          <div className="wheels">
            <ZhanchaWheel char={shownDice ? shownDice.dice[0] : '那'} rollKey={rollKey} cv={cv} rolling={rolling} delay={0} />
            <ZhanchaWheel char={shownDice ? shownDice.dice[1] : '佛'} rollKey={rollKey} cv={cv} rolling={rolling} delay={80} />
          </div>
          {rolling ? (
            <div className="dice-combo rolling-combo">{cv('輪轉中')}</div>
          ) : (
            dice && <div className="dice-combo">{cv(dice.combo)}</div>
          )}
          {last && (
            <div className={`dice-result k-${last.kind}`}>
              {last.kind === 'start' && cv(`起手 · ${last.gateName}「${last.name}」`)}
              {last.kind === 'move' && (
                <>{last.dir === 'up' ? '▲ ' : last.dir === 'down' ? '▼ ' : ''}{cv(`移至 ${last.gateName}「${last.name}」`)}</>
              )}
              {last.kind === 'win' && cv('🪷 成佛 · 圓極果位')}
              {last.kind === 'gift' && cv(`得赠掷 ${last.n}`)}
              {last.kind === 'blocked' && cv('不行 · 停步原位')}
              {last.kind === 'unresolved' && cv(`去向待核：${last.raw}`)}
            </div>
          )}
        </div>

        {last && last.note && (
          <div className="dice-note"><span className="note-label">{cv('譜曰')}</span>{cv(last.note)}</div>
        )}

        {!won ? (
          <button className="roll-btn" onClick={doRoll} disabled={rolling}>{cv(rolling ? '擲 行 中' : pos ? '擲 輪' : '起手擲輪')}</button>
        ) : (
          <div className="won-banner">{cv('🪷 圓極果位 · 成佛')}</div>
        )}
        <div className="panel-foot">
          {gift > 0 && <span className="gift-tag">{cv('赠掷')} · {gift}</span>}
          {path.length > 0 && <span className="step-tag">{cv('行棋')} · {path.length}</span>}
          <button className="reset-btn" onClick={reset}>{cv('重新開始')}</button>
        </div>

        <MoveCompass pos={pos} cv={cv} />

        <SinkRiseChart path={path} cv={cv} />

        <div className="game-log">
          {log.length === 0 && <div className="log-empty">{cv('行棋紀錄')}</div>}
          {log.map((l, i) => (
            <div key={i} className={`log-item k-${l.kind}`}>
              <b className="log-combo">{cv(l.combo)}</b><span>{cv(l.text)}</span>
            </div>
          ))}
        </div>
        <div className="panel-hint">{cv('點地圖任一位次，可看原文白話與升沈緣由')}</div>
      </aside>

      {won && <div className="buddha-light" />}
      <MobileRollDock pos={pos} dice={dice} last={last} won={won} rolling={rolling} doRoll={doRoll} reset={reset} cv={cv} />
      {picked && <PositionDetail id={picked} script={script} onClose={() => setPicked(null)} />}
      {pickedGate && <GateCardModal gateId={pickedGate} script={script} onClose={() => setPickedGate(null)} />}
    </main>
  );
}
