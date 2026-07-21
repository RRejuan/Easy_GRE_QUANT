import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type FeedbackCategory = "wrong-question" | "explanation-request" | "other";

export interface QuestionFeedback {
  questionId: string;
  skillId: string;
  category: FeedbackCategory;
  message: string;
  /** The resolved {{variable}} values the reporter saw, so the exact numbers
   * can be reproduced when investigating. */
  values: Record<string, number>;
  /** Signed-in reporter, if any -- lets the owner follow up. */
  userEmail: string | null;
}

export const canSubmitFeedback = isFirebaseConfigured;

/** Writes a report to the `feedback` collection, which is create-only for
 * clients (see firestore.rules); reports are read in the Firebase console. */
export async function submitQuestionFeedback(
  feedback: QuestionFeedback,
): Promise<void> {
  if (!db) throw new Error("Feedback requires Firebase to be configured");
  await addDoc(collection(db, "feedback"), {
    ...feedback,
    message: feedback.message.slice(0, 2000),
    createdAt: serverTimestamp(),
  });
}
