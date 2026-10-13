import { Link } from "react-router-dom";
import { GROUPS, statusOf, timeAgo } from "../utils.js";

export default function BankCard({ bank, highlight }) {
  return (
    <article className="card bank-card">
      <div className="bank-head">
        <div>
          <h3>{bank.name}</h3>
          <p className="muted">
            {bank.city}
            {bank.address ? `, ${bank.address}` : ""}
          </p>
        </div>
        <span className="muted small">Updated {timeAgo(bank.updatedAt)}</span>
      </div>

      <ul className="chips" aria-label="Blood stock">
        {GROUPS.map((g) => {
          const units = bank.stock?.[g] || 0;
          return (
            <li
              key={g}
              className={`chip chip-${statusOf(units)} ${highlight === g ? "chip-picked" : ""}`}
            >
              <b>{g}</b> {units}
            </li>
          );
        })}
      </ul>

      <div className="bank-actions">
        <Link to={`/banks/${bank._id}`} className="btn btn-primary">View stock &amp; request</Link>
        {bank.phone && (
          <a href={`tel:${bank.phone}`} className="btn btn-ghost">Call {bank.phone}</a>
        )}
      </div>
    </article>
  );
}
