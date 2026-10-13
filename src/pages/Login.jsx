import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorText } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
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
        <h1>Log in</h1>
        <form onSubmit={submit} className="stack">
          <label>
            <span>Email</span>
            <input type="email" required autoComplete="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" required autoComplete="current-password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          {error && <p className="alert alert-error">{error}</p>}
          <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        </form>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
      <img className="auth-img" src="/images/bank.svg" alt="" />
    </div>
  );
}
