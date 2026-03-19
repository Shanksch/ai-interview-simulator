"use server";

import { db } from "@/firebase/admin";
import { generateInterviewFeedback } from "@/lib/ai/feedback-generator";
import { extractInterviewParams } from "@/lib/ai/param-extractor";
import { generateQuestions } from "@/lib/services/interview.service";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Get interview metadata for context-aware feedback
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    const interview = interviewDoc.exists ? interviewDoc.data() : null;

    // Generate structured feedback using the AI pipeline
    const feedbackData = await generateInterviewFeedback({
      transcript,
      role: interview?.role,
      techstack: interview?.techstack,
    });

    const feedback = {
      interviewId,
      userId,
      ...feedbackData,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const doc = await db.collection("interviews").doc(id).get();
  if (!doc.exists) return null;

  return { id: doc.id, ...doc.data() } as Interview;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/**
 * Extract interview parameters from a conversation transcript
 * and generate interview questions.
 */
export async function generateInterviewFromTranscript(params: {
  userId: string;
  transcript: { role: string; content: string }[];
}): Promise<{ success: boolean }> {
  const { userId, transcript } = params;

  // Extract structured parameters from the conversation
  const interviewParams = await extractInterviewParams(transcript);

  // Generate questions and save the interview
  return generateQuestions({
    userid: userId,
    role: interviewParams.role,
    level: interviewParams.level,
    techstack: interviewParams.techstack,
    type: interviewParams.type,
    amount: interviewParams.amount,
  });
}