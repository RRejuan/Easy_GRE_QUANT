import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type FeedbackCategory = "wrong-question" | "explanation-request" | "other";

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  "wrong-question": "The question or answer is wrong",
  "explanation-request": "I'd like a better explanation",
  other: "Something else",
};

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
  /** Signed-in reporter's uid, or null for guests. Reports carrying a uid can
   * be read back by that user in their inbox (see firestore.rules). */
  userId: string | null;
}

/** One of the current user's reports as read back for the inbox, including any
 * reply the owner added (in the Firebase console) to the same document. */
export interface FeedbackReport {
  id: string;
  questionId: string;
  skillId: string;
  category: FeedbackCategory;
  message: string;
  status: string;
  adminReply?: string;
  /** Milliseconds since epoch, or null while the server timestamp is pending. */
  createdAt: number | null;
}

export const canSubmitFeedback = isFirebaseConfigured;

/** Writes a report to the `feedback` collection. Clients may create but not
 * edit reports; a signed-in reporter can read back their own (see
 * firestore.rules). The owner reviews and replies in the Firebase console. */
export async function submitQuestionFeedback(
  feedback: QuestionFeedback,
): Promise<void> {
  if (!db) throw new Error("Feedback requires Firebase to be configured");
  await addDoc(collection(db, "feedback"), {
    ...feedback,
    message: feedback.message.slice(0, 2000),
    status: "open",
    createdAt: serverTimestamp(),
  });
}

/** All reports filed by the given user, newest first. Sorted client-side to
 * avoid needing a composite Firestore index. */
export async function getMyReports(uid: string): Promise<FeedbackReport[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "feedback"), where("userId", "==", uid)),
  );
  const reports = snapshot.docs.map((doc) => {
    const data = doc.data();
    const ts = data.createdAt as Timestamp | null | undefined;
    return {
      id: doc.id,
      questionId: data.questionId as string,
      skillId: data.skillId as string,
      category: data.category as FeedbackCategory,
      message: data.message as string,
      status: (data.status as string) ?? "open",
      adminReply: (data.adminReply as string | undefined) || undefined,
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    } satisfies FeedbackReport;
  });
  reports.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return reports;
}

// --- Unread-reply tracking (local per account) ----------------------------
// A reply counts as unread until the user opens their inbox while it's
// present. Tracked in local storage keyed by uid so it never crosses accounts.

function seenRepliesKey(uid: string): string {
  return `gre-quant:seen-replies:${uid}`;
}

function loadSeenReplies(uid: string): Set<string> {
  const raw = localStorage.getItem(seenRepliesKey(uid));
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function unreadReplyCount(uid: string, reports: FeedbackReport[]): number {
  const seen = loadSeenReplies(uid);
  return reports.filter((r) => r.adminReply && !seen.has(r.id)).length;
}

/** Marks every currently-replied report as seen and notifies listeners (the
 * header badge) to recompute. Called when the inbox is opened. */
export function markRepliesSeen(uid: string, reports: FeedbackReport[]): void {
  const seen = loadSeenReplies(uid);
  let changed = false;
  for (const r of reports) {
    if (r.adminReply && !seen.has(r.id)) {
      seen.add(r.id);
      changed = true;
    }
  }
  if (!changed) return;
  localStorage.setItem(seenRepliesKey(uid), JSON.stringify([...seen]));
  window.dispatchEvent(new Event("greql:replies-seen"));
}
