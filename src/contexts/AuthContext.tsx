import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../lib/firebase";
import { beginCloudSession, endCloudSession } from "../lib/storage/cloudSync";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        try {
          await beginCloudSession(nextUser.uid);
        } catch (err) {
          // Firestore unreachable (offline, rules mishap...): the app still
          // works off the account's local cache; writes retry on next load.
          console.warn("Cloud sync unavailable; using local data.", err);
        }
      } else {
        endCloudSession();
      }
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
    // Full reload so every page re-reads progress from the account's
    // namespace (same pattern as switching guest profiles).
    window.location.reload();
  }

  async function signOut() {
    if (!auth) return;
    await firebaseSignOut(auth);
    window.location.reload();
  }

  // Hold rendering until the initial auth check (and, when signed in, the
  // cloud pull) completes, so pages never render guest data first and then
  // flip to account data. Guests with no Firebase config skip this entirely.
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
