import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { errorText } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    role: params.get("role") === "hospital" ? "hospital" : "bank",
    name: "", email: "", password: "", city: "", address: "", phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const isBank = form.role === "bank";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      nav("/dashboard");
    } catch (err) {
      setError(errorText(err));
    }
    setBusy(false);
  };

  return (
    <div className="container auth">
      <div className="card auth-card">
        <h1>Create account</h1>
        <div className="role-toggle" role="group" aria-label="Account type">
          <button type="button" className={isBank ? "active" : ""} onClick={() => setForm({ ...form, role: "bank" })}>
            Blood bank
          </button>
          <button type="button" className={!isBank ? "active" : ""} onClick={() => setForm({ ...form, role: "hospital" })}>
            Hospital
          </button>
        </div>

        <form onSubmit={submit} className="stack">
          <label>
            <span>{isBank ? "Blood bank name" : "Hospital name"}</span>
            <input required value={form.name} onChange={set("name")} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
          </label>
          <label>
            <span>Password (6+ characters)</span>
            <input type="password" required minLength="6" autoComplete="new-password" value={form.password} onChange={set("password")} />
          </label>
          <label>
            <span>City</span>
            <input required value={form.city} onChange={set("city")} />
          </label>
          {isBank && (
            <label>
              <span>Address</span>
              <input value={form.address} onChange={set("address")} />
            </label>
          )}
          <label>
            <span>Phone</span>
            <input type="tel" value={form.phone} onChange={set("phone")} />
          </label>
          {error && <p className="alert alert-error">{error}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        </form>
        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
      <img className="auth-img" src="/images/hospital.svg" alt="" />
    </div>
  );
}
