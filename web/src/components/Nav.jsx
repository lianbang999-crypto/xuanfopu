import { convert } from '../lib/convert.js';

export default function Nav({ data, section, go, script, open, onClose }) {
  const cv = (s) => convert(s, script, 'hant');
  const active = (type, id) =>
    section.type === type && (id === undefined || section.id === id);

  return (
    <>
      {/* 移动端抽屉遮罩 */}
      <div className={`nav-scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <nav className={`nav ${open ? 'open' : ''}`}>
        <h3>{cv('卷首')}</h3>
        <button className={`nav-item ${active('preface') ? 'active' : ''}`}
          onClick={() => go({ type: 'preface' })}>
          <span className="idx">敘</span>{cv('選佛譜敘')}
        </button>
        <button className={`nav-item ${active('lunxiang') ? 'active' : ''}`}
          onClick={() => go({ type: 'lunxiang' })}>
          <span className="idx">相</span>{cv('輪相表法')}
        </button>

        <h3>{cv('十五門')}</h3>
        {data.gates.map((g) => (
          <button key={g.id}
            className={`nav-item ${active('gate', g.id) ? 'active' : ''}`}
            onClick={() => go({ type: 'gate', id: g.id })}>
            <span className="idx">{g.id}</span>
            {cv(g.name_hant)}
            <span className="cnt">{g.count}</span>
          </button>
        ))}

        <h3>{cv('附錄')}</h3>
        <button className={`nav-item ${active('colophon') ? 'active' : ''}`}
          onClick={() => go({ type: 'colophon' })}>
          <span className="idx">記</span>{cv('紀事')}
        </button>
      </nav>
    </>
  );
}
