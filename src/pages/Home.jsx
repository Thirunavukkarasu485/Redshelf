import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";
import { GROUPS } from "../utils.js";
import BloodTile from "../components/BloodTile.jsx";

export default function Home() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [group, setGroup] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    api.get("/banks/stats").then((r) => setStats(r.data)).catch(() => setStats(null));
  }, []);

  const go = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (group) p.set("group", group);
    if (city.trim()) p.set("city", city.trim());
    nav(`/search?${p.toString()}`);
  };

  const totals = stats?.totals || {};
  const max = Math.max(30, ...Object.values(totals));

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Find the blood you need, before it&rsquo;s urgent.</h1>
            <p className="lead">
              Blood banks update their stock every day. Hospitals search by blood group and city,
              see what is on the shelf right now, and send a request in one tap.
            </p>

            <form className="search-box" onSubmit={go}>
              <label>
                <span>Blood group</span>
                <select value={group} onChange={(e) => setGroup(e.target.value)}>
                  <option value="">Any group</option>
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>City</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                />
              </label>
              <button className="btn btn-primary btn-lg">Search stock</button>
            </form>

            <p className="muted small hero-note">
              {stats ? `${stats.banks} blood bank${stats.banks === 1 ? "" : "s"} sharing live stock` : "Free to search. No login needed."}
            </p>
          </div>
          <img className="hero-img" src="/images/hero.svg" alt="A blood bag filled with O positive blood" />
        </div>
      </section>

      <section className="section shelf">
        <div className="container">
          <h2>What is on the shelf today</h2>
          <p className="muted">Total units across all blood banks. Tap a bag to see who has it.</p>
          <div className="tile-grid">
            {GROUPS.map((g) => (
              <Link key={g} to={`/search?group=${encodeURIComponent(g)}`} aria-label={`Find ${g} blood`}>
                <BloodTile group={g} units={totals[g] || 0} max={max} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <img src="/images/save.svg" alt="" />
              <h3>1. Banks update stock</h3>
              <p>A blood bank logs in and sets the units it has for each group. It takes under a minute.</p>
            </div>
            <div className="step">
              <img src="/images/search.svg" alt="" />
              <h3>2. Hospitals search</h3>
              <p>Pick a blood group and city. Banks with the most units show first, with their phone number.</p>
            </div>
            <div className="step">
              <img src="/images/send.svg" alt="" />
              <h3>3. Send a request</h3>
              <p>Ask for the units you need and mark it urgent. The bank accepts it and the stock updates.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container join-grid">
          <div className="join join-bank">
            <img src="/images/bank.svg" alt="" />
            <div>
              <h3>Run a blood bank?</h3>
              <p>List your stock for free and receive requests from hospitals nearby.</p>
              <Link to="/register?role=bank" className="btn btn-primary">Register your blood bank</Link>
            </div>
          </div>
          <div className="join join-hospital">
            <img src="/images/hospital.svg" alt="" />
            <div>
              <h3>Work at a hospital?</h3>
              <p>Make an account to send blood requests and track each one until it is delivered.</p>
              <Link to="/register?role=hospital" className="btn btn-dark">Register your hospital</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
