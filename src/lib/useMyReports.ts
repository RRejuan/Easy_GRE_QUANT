import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeMyReports, type FeedbackReport } from "./feedback";
import { db } from "./firebase";

/** Live view of the signed-in user's question reports. Updates in real time,
 * so a reply added in the Firebase console lights up the inbox badge without a
 * refresh. Empty for guests or when Firebase isn't configured. */
export function useMyReports(): {
  reports: FeedbackReport[];
  loading: boolean;
  error: boolean;
} {
  const { user } = useAuth();
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const unsubscribe = subscribeMyReports(
      user.uid,
      (r) => {
        setReports(r);
        setLoading(false);
      },
      () => {
        setError(true);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  return { reports, loading, error };
}
