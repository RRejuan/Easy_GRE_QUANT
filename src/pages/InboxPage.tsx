import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMyReports } from "../lib/useMyReports";
import {
  canSubmitFeedback,
  FEEDBACK_CATEGORY_LABELS,
  markRepliesSeen,
  type FeedbackReport,
} from "../lib/feedback";
import { getSkill } from "../lib/content";

function formatDate(ms: number | null): string {
  if (ms === null) return "Just now";
  return new Date(ms).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReportCard({ report }: { report: FeedbackReport }) {
  const skill = getSkill(report.skillId);
  const replied = Boolean(report.adminReply);
  return (
    <li className={`inbox-item${replied ? " inbox-item-replied" : ""}`}>
      <div className="inbox-item-head">
        <span className="inbox-item-category">
          {FEEDBACK_CATEGORY_LABELS[report.category] ?? report.category}
        </span>
        <span className="inbox-item-date">{formatDate(report.createdAt)}</span>
      </div>
      <p className="inbox-item-meta">
        On{" "}
        {skill ? (
          <Link to={`/skill/${report.skillId}`}>{skill.name}</Link>
        ) : (
          report.skillId
        )}{" "}
        · question <code>{report.questionId}</code>
      </p>
      {report.message && <p className="inbox-item-message">"{report.message}"</p>}
      {replied ? (
        <div className="inbox-reply">
          <span className="inbox-reply-label">Reply</span>
          <p>{report.adminReply}</p>
        </div>
      ) : (
        <p className="inbox-item-pending">Awaiting a response.</p>
      )}
    </li>
  );
}

export function InboxPage() {
  const { user } = useAuth();
  const { reports, loading, error } = useMyReports();

  // Clear the unread badge once the reports are on screen.
  useEffect(() => {
    if (user && !loading) markRepliesSeen(user.uid, reports);
  }, [user, loading, reports]);

  return (
    <div className="skill-page inbox-page">
      <h1>Inbox</h1>

      {!canSubmitFeedback ? (
        <p>Reports aren't available in this build.</p>
      ) : !user ? (
        <p>
          Sign in with Google (top right) to file question reports and see
          replies here.
        </p>
      ) : loading ? (
        <p>Loading your reports…</p>
      ) : error ? (
        <p>Couldn't load your reports. Check your connection and refresh.</p>
      ) : reports.length === 0 ? (
        <p>
          You haven't sent any reports yet. Use “Report a problem or ask about
          this question” under any question, and replies will show up here.
        </p>
      ) : (
        <ul className="inbox-list">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </ul>
      )}
    </div>
  );
}
