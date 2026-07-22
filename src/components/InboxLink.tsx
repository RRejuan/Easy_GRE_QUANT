import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMyReports } from "../lib/useMyReports";
import { canSubmitFeedback, unreadReplyCount } from "../lib/feedback";

/** Header link to the report inbox, shown only to signed-in users. Carries a
 * badge with the number of replies not yet seen; the badge clears when the
 * inbox is opened (which fires the `greql:replies-seen` event). */
export function InboxLink() {
  const { user } = useAuth();
  const { reports } = useMyReports();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const recompute = () =>
      setUnread(user ? unreadReplyCount(user.uid, reports) : 0);
    recompute();
    window.addEventListener("greql:replies-seen", recompute);
    return () => window.removeEventListener("greql:replies-seen", recompute);
  }, [user, reports]);

  if (!user || !canSubmitFeedback) return null;

  return (
    <Link to="/inbox" className="inbox-link">
      Inbox
      {unread > 0 && <span className="inbox-badge">{unread}</span>}
    </Link>
  );
}
