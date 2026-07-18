import { Link, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const { user } = useAuth();
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
          <Link to="/about-gre">All About GRE</Link>
          <Link to="/about-us">About Us</Link>
        </nav>
        {/* Signed-in users' progress lives on their account and syncs to the
            cloud, so guest profiles and manual export/import don't apply. */}
        {!user && <ProfileSwitcher />}
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
