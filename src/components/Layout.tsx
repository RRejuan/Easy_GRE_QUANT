import { Link, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { InboxLink } from "./InboxLink";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="logo-link">
          <Logo />
        </Link>
        <nav className="app-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/verbal">Verbal</Link>
          <Link to="/vocab">Vocabulary</Link>
          <Link to="/diagnostic">Diagnostic</Link>
          <Link to="/mock-test">Mock Test</Link>
          <Link to="/about-gre">All About GRE</Link>
          <Link to="/about-us">About Us</Link>
        </nav>
        <InboxLink />
        <GoogleSignInButton />
        <a
          href="https://paypal.me/GREQL"
          target="_blank"
          rel="noopener noreferrer"
          className="donate-link"
        >
          Support this project
        </a>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
