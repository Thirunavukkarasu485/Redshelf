import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const close = () => setOpen(false);

  const signOut = () => {
    logout();
    close();
    nav("/");
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <img src="/images/logo.svg" alt="" width="34" height="34" />
          <span>RedShelf</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/search" onClick={close}>Find blood</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" onClick={close}>
                {user.role === "bank" ? "My stock" : "My requests"}
              </NavLink>
              <button className="btn btn-ghost" onClick={signOut}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link to="/register" className="btn btn-primary" onClick={close}>Join RedShelf</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
