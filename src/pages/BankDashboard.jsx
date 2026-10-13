import { useEffect, useState } from "react";
import api, { errorText } from "../api.js";
import { GROUPS, timeAgo } from "../utils.js";

export default function BankDashboard() {
  const [bank, setBank] = useState(null);
  const [stock, setStock] = useState({});
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [b, r] = await Promise.all([api.get("/banks/mine"), api.get("/requests/mine")]);
    setBank(b.data);
    setStock({ ...b.data.stock });
    setRequests(r.data);
  };

  useEffect(() => {
    load().catch((e) => setMsg({ type: "error", text: errorText(e, "Could not load your dashboard.") }));
  }, []);

  const change = (g, value) =>
    setStock((s) => ({ ...s, [g]: Math.max(0, Math.floor(Number(value) || 0)) }));

  const save = async () => {
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      const { data } = await api.put("/banks/mine/stock", { stock });
      setBank(data);
      setMsg({ type: "ok", text: "Stock saved. Hospitals can see the new numbers now." });
    } catch (e) {
      setMsg({ type: "error", text: errorText(e) });
    }
    setSaving(false);
  };

  const setStatus = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      await load();
    } catch (e) {
      setMsg({ type: "error", text: errorText(e) });
    }
  };

  if (!bank) {
    return (
      <div className="container section">
        {msg.text ? <p className={`alert alert-${msg.type}`}>{msg.text}</p> : <div className="skeleton" />}
      </div>
    );
  }

  const total = GROUPS.reduce((sum, g) => sum + (stock[g] || 0), 0);
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="container section">
      <div className="detail-head">
        <div>
          <h1>{bank.name}</h1>
          <p className="muted">{bank.city} &middot; {total} units in stock &middot; {pending} new request{pending === 1 ? "" : "s"}</p>
        </div>
      </div>

      <section className="card">
        <h2>Update stock</h2>
        <p className="muted">Change the units for each blood group, then press Save.</p>
        <div className="stock-grid">
          {GROUPS.map((g) => (
            <div className="stock-item" key={g}>
              <b className="stock-group">{g}</b>
              <div className="stepper">
                <button type="button" aria-label={`Remove one ${g}`} onClick={() => change(g, (stock[g] || 0) - 1)}>&minus;</button>
                <input
                  type="number" min="0" inputMode="numeric" aria-label={`${g} units`}
                  value={stock[g] ?? 0} onChange={(e) => change(g, e.target.value)}
                />
                <button type="button" aria-label={`Add one ${g}`} onClick={() => change(g, (stock[g] || 0) + 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save stock"}
        </button>
        {msg.text && <p className={`alert alert-${msg.type}`}>{msg.text}</p>}
      </section>

      <h2 className="gap-top">Requests from hospitals</h2>
      {requests.length === 0 && (
        <div className="empty">
          <img src="/images/send.svg" alt="" width="90" />
          <p>No requests yet. They will show up here when a hospital asks for blood.</p>
        </div>
      )}
      <div className="list">
        {requests.map((r) => (
          <article key={r._id} className="card request-row">
            <div>
              <h3>
                {r.units} unit{r.units > 1 ? "s" : ""} of {r.group}
                {r.urgency === "urgent" && <span className="pill pill-urgent">Urgent</span>}
              </h3>
              <p className="muted">
                {r.hospitalName} &middot; {timeAgo(r.createdAt)}
                {r.hospitalPhone && <> &middot; <a href={`tel:${r.hospitalPhone}`}>{r.hospitalPhone}</a></>}
              </p>
              {r.note && <p className="small">{r.note}</p>}
            </div>
            <div className="request-side">
              <span className={`pill pill-${r.status}`}>{r.status}</span>
              {r.status === "pending" && (
                <div className="btn-row">
                  <button className="btn btn-primary btn-sm" onClick={() => setStatus(r._id, "accepted")}>Accept</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setStatus(r._id, "rejected")}>Reject</button>
                </div>
              )}
              {r.status === "accepted" && (
                <button className="btn btn-dark btn-sm" onClick={() => setStatus(r._id, "fulfilled")}>
                  Mark as given
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
