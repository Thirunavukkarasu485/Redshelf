import { statusOf, statusLabel } from "../utils.js";

// A blood bag that fills up with the number of units
export default function BloodTile({ group, units = 0, max = 30, showStatus = false }) {
  const level = Math.min(100, Math.round((units / max) * 100));
  const status = statusOf(units);
  return (
    <div className={`tile tile-${status}`}>
      <div className="tile-liquid" style={{ height: `${units > 0 ? Math.max(level, 12) : 0}%` }} />
      <span className="tile-group">{group}</span>
      <span className="tile-units">
        <strong>{units}</strong> units
      </span>
      {showStatus && <span className={`pill pill-${status} tile-status`}>{statusLabel[status]}</span>}
    </div>
  );
}
