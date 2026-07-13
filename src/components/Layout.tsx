import { Link, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { ProfileSwitcher } from "./ProfileSwitcher";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="logo-link">
          <Logo />
        </Link>
        <nav className="app-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/skills">Skills</Link>
          <Link to="/diagnostic">Diagnostic</Link>
          <Link to="/mock-test">Mock Test</Link>
          <Link to="/about-gre">About the GRE</Link>
        </nav>
        <ProfileSwitcher />
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
