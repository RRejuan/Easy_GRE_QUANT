import { useState } from "react";
import type { Question } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import {
  canSubmitFeedback,
  submitQuestionFeedback,
  type FeedbackCategory,
} from "../../lib/feedback";

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  "wrong-question": "The question or answer is wrong",
  "explanation-request": "I'd like a better explanation",
  other: "Something else",
};

/** Small always-available control under each question for reporting an error
 * or asking for a better explanation. Reports go to the Firestore `feedback`
 * collection for the owner to review. */
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
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="report-question-thanks">
        Thanks — your report was sent and will be reviewed.
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
        {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((key) => (
          <label key={key}>
            <input
              type="radio"
              name={`report-category-${question.id}`}
              checked={category === key}
              onChange={() => setCategory(key)}
            />{" "}
            {CATEGORY_LABELS[key]}
          </label>
        ))}
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
      {state === "error" && (
        <p className="report-question-error">
          Couldn't send the report — check your connection and try again.
        </p>
      )}
    </div>
  );
}
