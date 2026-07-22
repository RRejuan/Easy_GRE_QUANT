import { useState } from "react";
import { Link } from "react-router-dom";
import type { Question } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import {
  canSubmitFeedback,
  FEEDBACK_CATEGORY_LABELS,
  submitQuestionFeedback,
  type FeedbackCategory,
} from "../../lib/feedback";

/** Small always-available control under each question for reporting an error
 * or asking for a better explanation. Reports go to the Firestore `feedback`
 * collection for the owner to review; signed-in reporters can read replies
 * back in their inbox. */
export function ReportQuestionButton({
  question,
  values,
}: {
  question: Question;
  values: Record<string, number>;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("wrong-question");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  if (!canSubmitFeedback) return null;

  async function handleSubmit() {
    setState("sending");
    try {
      await submitQuestionFeedback({
        questionId: question.id,
        skillId: question.primarySkill,
        category,
        message: message.trim(),
        values,
        userEmail: user?.email ?? null,
        userId: user?.uid ?? null,
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="report-question-thanks">
        Thanks — your report was sent.{" "}
        {user ? (
          <>
            Track it and any reply in your <Link to="/inbox">Inbox</Link>.
          </>
        ) : (
          "It will be reviewed."
        )}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="report-question-toggle"
        onClick={() => setOpen(true)}
      >
        Report a problem or ask about this question
      </button>
    );
  }

  return (
    <div className="report-question-form">
      <fieldset>
        <legend>What's the issue?</legend>
        {(Object.keys(FEEDBACK_CATEGORY_LABELS) as FeedbackCategory[]).map(
          (key) => (
            <label key={key}>
              <input
                type="radio"
                name={`report-category-${question.id}`}
                checked={category === key}
                onChange={() => setCategory(key)}
              />{" "}
              {FEEDBACK_CATEGORY_LABELS[key]}
            </label>
          ),
        )}
      </fieldset>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional details — what looks wrong, or what part needs a clearer explanation?"
        rows={3}
        maxLength={2000}
      />
      <div className="report-question-actions">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={state === "sending"}
        >
          {state === "sending" ? "Sending..." : "Send report"}
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      {!user && (
        <p className="report-question-note">
          Sign in with Google before reporting to get replies in your inbox.
        </p>
      )}
      {state === "error" && (
        <p className="report-question-error">
          Couldn't send the report — check your connection and try again.
        </p>
      )}
    </div>
  );
}
