import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getMyReports, type FeedbackReport } from "./feedback";
import { db } from "./firebase";

/** Loads the signed-in user's question reports once per sign-in. Returns an
 * empty list for guests or when Firebase isn't configured. */
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
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getMyReports(user.uid)
      .then((r) => {
        if (!cancelled) setReports(r);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { reports, loading, error };
}
