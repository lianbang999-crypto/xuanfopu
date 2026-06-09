import { convert } from '../lib/convert.js';

// 简繁两态切换：繁體 ⇄ 簡體（默认繁体）
const NEXT = { hant: 'cn', cn: 'hant' };
const LABEL = { hant: '繁體', cn: '簡體' };

export default function Header({ script, setScript, onMenu, mode, setMode }) {
  const cv = (s) => convert(s, script, 'hant');
  return (
    <header className="app-header">
      <button className="hamburger" onClick={onMenu} aria-label="目錄" title="目錄">☰</button>
      <div className="brand">
        <h1 className="title">{cv('選佛譜')}</h1>
        <span className="subtitle">{cv('蕅益大師智旭 著 · 原文白話對照')}</span>
      </div>
      <div className="spacer" />
      {setMode && (
        <div className="mode-switch">
          <button className={mode === 'read' ? 'active' : ''} onClick={() => setMode('read')}>{cv('閱讀')}</button>
          <button className={mode === 'game' ? 'active' : ''} onClick={() => setMode('game')}>{cv('遊戲')}</button>
        </div>
      )}
      <button
        className="script-toggle"
        onClick={() => setScript(NEXT[script])}
        title="簡繁切換（opencc）"
      >
        {cv('字')} · <span className="mode">{cv(LABEL[script])}</span>
      </button>
    </header>
  );
}
