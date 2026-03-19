"use server";

import { db } from "@/firebase/admin";
import { generateInterviewFeedback } from "@/lib/ai/feedback-generator";
import { NotFoundError } from "@/lib/errors";

/**
 * Generate AI feedback for an interview transcript and save to Firestore.
 */
export async function generateFeedback(params: {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}): Promise<{ success: boolean; feedbackId: string }> {
  const { interviewId, userId, transcript, feedbackId } = params;

  // Get interview data for context
  const interviewDoc = await db
    .collection("interviews")
    .doc(interviewId)
    .get();
  const interview = interviewDoc.exists ? interviewDoc.data() : null;

  // Generate structured feedback using AI pipeline
  const feedbackData = await generateInterviewFeedback({
    transcript,
    role: interview?.role,
    techstack: interview?.techstack,
  });

  const feedbackDoc = {
    interviewId,
    userId,
    ...feedbackData,
    createdAt: new Date().toISOString(),
  };

  let savedFeedbackId: string;

  if (feedbackId) {
    // Update existing feedback
    await db.collection("feedback").doc(feedbackId).set(feedbackDoc);
    savedFeedbackId = feedbackId;
  } else {
    // Create new feedback
    const docRef = await db.collection("feedback").add(feedbackDoc);
    savedFeedbackId = docRef.id;
  }

  return { success: true, feedbackId: savedFeedbackId };
}

/**
 * Get feedback for a specific interview by a specific user.
 */
export async function getFeedbackByInterviewId(params: {
  interviewId: string;
  userId: string;
}): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  if (!interviewId || !userId) return null;

  const snapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Feedback;
}
