import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="brand">
            <img src="/images/logo.svg" alt="" width="30" height="30" />
            <span>RedShelf</span>
          </Link>
          <p>Live blood stock from blood banks, in one place.</p>
        </div>
        <div className="footer-links">
          <Link to="/search">Find blood</Link>
          <Link to="/register">Register your blood bank</Link>
          <Link to="/login">Log in</Link>
        </div>
      </div>
      <p className="container footer-note">
        In an emergency, call your local emergency number first. Stock numbers are updated by blood
        banks and may change quickly, so always call the bank to confirm.
      </p>
    </footer>
  );
}
