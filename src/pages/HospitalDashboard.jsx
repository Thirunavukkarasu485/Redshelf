import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorText } from "../api.js";
import { timeAgo } from "../utils.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/requests/mine").then((r) => setList(r.data)).catch((e) => setError(errorText(e)));
  }, []);

  return (
    <div className="container section">
      <div className="detail-head">
        <div>
          <h1>My requests</h1>
          <p className="muted">Signed in as {user.name}</p>
        </div>
        <Link to="/search" className="btn btn-primary btn-lg">Find blood</Link>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {!list && !error && <div className="skeleton" />}
      {list && list.length === 0 && (
        <div className="empty">
          <img src="/images/send.svg" alt="" width="90" />
          <p>You have not sent any requests yet. Search for a blood bank to send your first one.</p>
        </div>
      )}

      <div className="list">
        {list?.map((r) => (
          <article key={r._id} className="card request-row">
            <div>
              <h3>
                {r.units} unit{r.units > 1 ? "s" : ""} of {r.group}
                {r.urgency === "urgent" && <span className="pill pill-urgent">Urgent</span>}
              </h3>
              <p className="muted">
                To {r.bank?.name} ({r.bank?.city}) &middot; {timeAgo(r.createdAt)}
              </p>
              {r.note && <p className="small">{r.note}</p>}
            </div>
            <div className="request-side">
              <span className={`pill pill-${r.status}`}>{r.status}</span>
              {r.bank?.phone && <a href={`tel:${r.bank.phone}`} className="small">Call bank</a>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
