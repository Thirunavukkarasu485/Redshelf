import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorText } from "../api.js";
import { GROUPS } from "../utils.js";
import BankCard from "../components/BankCard.jsx";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const group = params.get("group") || "";
  const city = params.get("city") || "";

  const [cityInput, setCityInput] = useState(city);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/banks", { params: { group, city } })
      .then((r) => setBanks(r.data))
      .catch((e) => setError(errorText(e, "Could not load blood banks. Please try again.")))
      .finally(() => setLoading(false));
  }, [group, city]);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(params);
    value ? p.set(key, value) : p.delete(key);
    setParams(p);
  };

  return (
    <div className="container section">
      <h1>Find blood</h1>

      <div className="filters">
        <div className="group-picker" role="group" aria-label="Blood group">
          <button
            className={`group-btn ${group === "" ? "active" : ""}`}
            onClick={() => setFilter("group", "")}
          >
            All
          </button>
          {GROUPS.map((g) => (
            <button
              key={g}
              className={`group-btn ${group === g ? "active" : ""}`}
              onClick={() => setFilter("group", g)}
            >
              {g}
            </button>
          ))}
        </div>

        <form
          className="city-form"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter("city", cityInput.trim());
          }}
        >
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Search by city"
            aria-label="City"
          />
          <button className="btn btn-primary">Search</button>
        </form>
      </div>

      {loading && (
        <div className="list">
          <div className="skeleton" /><div className="skeleton" /><div className="skeleton" />
        </div>
      )}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && (
        <>
          <p className="muted">
            {banks.length} blood bank{banks.length === 1 ? "" : "s"} found
            {group ? ` with ${group}` : ""}
            {city ? ` in ${city}` : ""}
          </p>
          {banks.length === 0 ? (
            <div className="empty">
              <img src="/images/search.svg" alt="" width="90" />
              <p>No blood banks match. Try another city, or choose &ldquo;All&rdquo; groups.</p>
            </div>
          ) : (
            <div className="list">
              {banks.map((b) => (
                <BankCard key={b._id} bank={b} highlight={group} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
