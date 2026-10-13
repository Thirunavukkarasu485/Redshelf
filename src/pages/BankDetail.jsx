import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { errorText } from "../api.js";
import { GROUPS, timeAgo } from "../utils.js";
import { useAuth } from "../context/AuthContext.jsx";
import BloodTile from "../components/BloodTile.jsx";

export default function BankDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [bank, setBank] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ group: "O+", units: 1, urgency: "normal", note: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/banks/${id}`).then((r) => setBank(r.data)).catch((e) => setError(errorText(e)));
  }, [id]);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    setMsg({ type: "", text: "" });
    try {
      await api.post("/requests", { ...form, bankId: id });
      setMsg({ type: "ok", text: "Request sent. The blood bank will respond from their dashboard. Track it under My requests." });
      setForm({ ...form, units: 1, note: "" });
    } catch (err) {
      setMsg({ type: "error", text: errorText(err) });
    }
    setSending(false);
  };

  if (error) return <div className="container section"><p className="alert alert-error">{error}</p></div>;
  if (!bank) return <div className="container section"><div className="skeleton" /></div>;

  return (
    <div className="container section">
      <Link to="/search" className="back">&larr; Back to search</Link>
      <div className="detail-head">
        <div>
          <h1>{bank.name}</h1>
          <p className="muted">
            {bank.city}
            {bank.address ? `, ${bank.address}` : ""} &middot; Updated {timeAgo(bank.updatedAt)}
          </p>
        </div>
        {bank.phone && <a className="btn btn-primary btn-lg" href={`tel:${bank.phone}`}>Call {bank.phone}</a>}
      </div>

      <div className="tile-grid">
        {GROUPS.map((g) => (
          <BloodTile key={g} group={g} units={bank.stock?.[g] || 0} showStatus />
        ))}
      </div>

      <section className="card request-box">
        <h2>Request blood</h2>
        {!user && (
          <p>
            <Link to="/login">Log in</Link> with a hospital account to send a request, or{" "}
            <Link to="/register?role=hospital">register your hospital</Link>.
          </p>
        )}
        {user?.role === "bank" && <p className="muted">Blood bank accounts cannot send requests.</p>}
        {user?.role === "hospital" && (
          <form onSubmit={send} className="form-grid">
            <label>
              <span>Blood group</span>
              <select value={form.group} onChange={update("group")}>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>{g} ({bank.stock?.[g] || 0} in stock)</option>
                ))}
              </select>
            </label>
            <label>
              <span>Units needed</span>
              <input type="number" min="1" value={form.units} onChange={update("units")} required />
            </label>
            <label>
              <span>How soon?</span>
              <select value={form.urgency} onChange={update("urgency")}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label className="full">
              <span>Note (optional)</span>
              <textarea rows="3" maxLength="300" value={form.note} onChange={update("note")}
                placeholder="Patient ward, contact person, time needed..." />
            </label>
            <div className="full">
              <button className="btn btn-primary btn-lg" disabled={sending}>
                {sending ? "Sending..." : "Send request"}
              </button>
            </div>
          </form>
        )}
        {msg.text && <p className={`alert alert-${msg.type}`}>{msg.text}</p>}
      </section>
    </div>
  );
}
