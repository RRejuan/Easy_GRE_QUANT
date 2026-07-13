import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../lib/firebase";

export function GoogleSignInButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (!isFirebaseConfigured || loading) return null;

  if (user) {
    return (
      <div className="google-account">
        {user.photoURL && (
          <img src={user.photoURL} alt="" className="google-account-photo" />
        )}
        <span className="google-account-name">
          {user.displayName?.split(" ")[0] ?? "Signed in"}
        </span>
        <button type="button" onClick={() => signOut()} className="google-account-signout">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => signInWithGoogle()} className="google-signin-button">
      Sign in with Google
    </button>
  );
}
