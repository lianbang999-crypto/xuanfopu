import { GATE_CARDS } from '../data/gate-cards.js';
import { GATES } from '../lib/game.js';
import { convert } from '../lib/convert.js';
import '../styles/gate-card-modal.css';

const gateName = Object.fromEntries(GATES.map((gate) => [gate.id, gate.name]));

export default function GateCardModal({ gateId, script, onClose }) {
  const cv = (s) => convert(s, script, 'hant');
  const card = GATE_CARDS.find((item) => item.id === Number(gateId));
  if (!card) return null;

  return (
    <div className="gate-card-backdrop" role="presentation" onClick={onClose}>
      <section className={`gate-card-modal gate-card-${card.id}`} role="dialog" aria-modal="true" aria-label={cv(`${gateName[card.id]}門卡`)} onClick={(event) => event.stopPropagation()}>
        <button className="gate-card-close" type="button" onClick={onClose} aria-label={cv('關閉')}>×</button>
        <div className="gate-card-orb" aria-hidden="true">{cv(card.icon)}</div>
        <div className="gate-card-kicker">{cv(`第${card.id}門`)}</div>
        <h2>{cv(gateName[card.id])}</h2>
        <p className="gate-card-subtitle">{cv(card.subtitle)}</p>

        <div className="gate-card-meta">
          <span>{cv(card.role)}</span>
          <span>{card.count}{cv('位')}</span>
        </div>

        <div className="gate-card-keywords">
          {card.keywords.map((keyword) => <span key={keyword}>{cv(keyword)}</span>)}
        </div>

        <div className="gate-card-section">
          <strong>{cv('本門要義')}</strong>
          <p>{cv(card.summary)}</p>
        </div>

        <div className="gate-card-section muted">
          <strong>{cv('遊戲提示')}</strong>
          <p>{cv(card.hint)}</p>
        </div>
      </section>
    </div>
  );
}
