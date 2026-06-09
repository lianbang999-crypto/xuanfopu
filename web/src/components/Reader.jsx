import { useState, useMemo } from 'react';
import { convert } from '../lib/convert.js';

// enso 圆相分隔（水墨手绘开口圆）
function Enso() {
  return (
    <svg className="enso" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M74 27 a36 36 0 1 0 10 14" fill="none"
        stroke="var(--ink)" strokeWidth="5.5" strokeLinecap="round" opacity="0.82" />
    </svg>
  );
}

// 行内解析 **粗体**（白话译文中标注「轮相对应 / 谱曰」等）
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) => {
    const m = seg.match(/^\*\*([^*]+)\*\*$/);
    return m ? <strong key={i}>{m[1]}</strong> : seg;
  });
}

// 按换行拆段渲染，支持 **粗体** 与「- 」列表项
function Prose({ text, cls }) {
  if (!text) return null;
  return text.split('\n').filter((s) => s.trim()).map((line, i) => {
    const isLi = /^[-•]\s+/.test(line);
    const body = isLi ? line.replace(/^[-•]\s+/, '') : line;
    return <p key={i} className={isLi ? `${cls} li` : cls}>{renderInline(body)}</p>;
  });
}

// 双栏对照容器：桌面左右并排；窄屏「白話｜原文」标签切换（默认白话）
function DualPane({ hant, vern }) {
  const [tab, setTab] = useState('vern');
  return (
    <div className="dual" data-pane={tab}>
      <div className="pane-tabs" role="tablist">
        <button type="button" className={tab === 'vern' ? 'active' : ''}
          onClick={() => setTab('vern')}>白話</button>
        <button type="button" className={tab === 'hant' ? 'active' : ''}
          onClick={() => setTab('hant')}>原文</button>
      </div>
      <div className="pane pane-hant"><div className="label">原文</div>{hant}</div>
      <div className="pane pane-vern"><div className="label">白話</div>{vern}</div>
    </div>
  );
}

// 概述类双栏对照（叙 / 轮相表法 / 门序 / 纪事）
function DualProse({ hant, vern, script }) {
  const h = useMemo(() => convert(hant, script, 'hant'), [hant, script]);
  const v = useMemo(() => convert(vern, script, 'vern'), [vern, script]);
  return (
    <article className="position">
      <DualPane hant={<Prose text={h} cls="pu" />} vern={<Prose text={v} cls="pu-vern" />} />
    </article>
  );
}

// 升降去向分类（用于着色）：赠掷 / 堕恶趣 / 人天 / 出世修证
function classifyTo(to) {
  if (/贈/.test(to)) return 'gift';
  if (/(獄|鬼|畜|脩羅|魔)/.test(to)) return 'fall';
  if (/(洲|天|王|仙|梵)/.test(to)) return 'human';
  return 'rise';
}

// 结构化轮相升降表：每行「组合 → 去向」，紧凑双列、按去向着色
function LunTable({ transitions, script }) {
  if (!transitions || !transitions.length) return null;
  return (
    <div className="luntable">
      {transitions.map((t, i) => (
        <div className="lun-row" data-kind={classifyTo(t.to)} key={i}>
          <span className="lun-combos">
            {t.combos.map((c) => (
              <b className="lun-combo" key={c}>{convert(c, script, 'hant')}</b>
            ))}
          </span>
          <span className="lun-arrow">→</span>
          <span className="lun-to">{convert(t.to, script, 'hant')}</span>
        </div>
      ))}
    </div>
  );
}

// 单个位次对照卡：升降表 + 谱曰双栏对照
function Position({ p, script }) {
  const t = useMemo(() => ({
    combo: convert(p.combo, script, 'hant'),
    name: convert(p.name_hant, script, 'hant'),
    extra: convert(p.extra_hant, script, 'hant'),
    pu: convert(p.pu_hant, script, 'hant'),
    vern: convert(p.pu_vern, script, 'vern'),
  }), [p, script]);

  const hantNode = (
    <>
      {p.extra_hant && <Prose text={t.extra} cls="pu" />}
      <Prose text={t.pu} cls="pu" />
    </>
  );
  const vernNode = <Prose text={t.vern} cls="pu-vern" />;

  return (
    <article className="position" id={p.id}>
      <div className="position-bar">
        {p.combo && <span className="combo">{t.combo}</span>}
        <span className="pos-name">{t.name}</span>
        <span className="src">{p.source}</span>
      </div>
      <LunTable transitions={p.transitions} script={script} />
      <DualPane hant={hantNode} vern={vernNode} />
    </article>
  );
}

export default function Reader({ data, section, script }) {
  const cvH = (s) => convert(s, script, 'hant');

  if (section.type === 'preface') {
    return (
      <main className="reader">
        <div className="section-head"><h2>{cvH('選佛譜敘')}</h2><Enso /></div>
        <DualProse hant={data.preface.hant} vern={data.preface.vern} script={script} />
      </main>
    );
  }

  if (section.type === 'lunxiang') {
    return (
      <main className="reader">
        <div className="section-head">
          <h2>{cvH('輪相表法第一')}</h2>
          <div className="meta">{cvH('附 位次升降第二')}</div>
          <Enso />
        </div>
        <DualProse hant={data.lunxiang.hant} vern={data.lunxiang.vern} script={script} />
      </main>
    );
  }

  if (section.type === 'colophon') {
    return (
      <main className="reader">
        <div className="section-head"><h2>{cvH('紀事')}</h2><Enso /></div>
        <DualProse hant={data.colophon.hant} vern={data.colophon.vern} script={script} />
      </main>
    );
  }

  // 门
  const g = data.gates.find((x) => x.id === section.id);
  if (!g) return <main className="reader" />;
  const ord = g.name_full_hant.replace(g.name_hant, '');
  return (
    <main className="reader">
      <div className="section-head">
        <div className="gate-ord">{cvH(ord)}</div>
        <h2>{cvH(g.name_hant)}</h2>
        <div className="meta">{cvH(`凡 ${g.count} 位`)}</div>
        <Enso />
      </div>
      {(g.intro_hant || g.intro_vern) && (
        <DualProse hant={g.intro_hant} vern={g.intro_vern} script={script} />
      )}
      {g.positions.map((p) => <Position key={p.id} p={p} script={script} />)}
    </main>
  );
}
