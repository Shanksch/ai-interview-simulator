"use server";

import { db } from "@/firebase/admin";
import { buildQuestionGenerationPrompt } from "@/lib/ai/prompt-builder";
import { generateTextWithRetry } from "@/lib/ai/llm-client";
import { getRandomInterviewCover } from "@/lib/utils";
import { NotFoundError, ValidationError } from "@/lib/errors";

interface GenerateQuestionsParams {
  type: string;
  role: string;
  level: string;
  techstack: string;
  amount: number;
  userid: string;
}

/**
 * Generate interview questions using AI and save the interview to Firestore.
 */
export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<{ success: boolean }> {
  const { type, role, level, techstack, amount, userid } = params;

  if (!role || !level || !userid) {
    throw new ValidationError("Missing required fields: role, level, userid");
  }

  const prompt = buildQuestionGenerationPrompt({
    role,
    level,
    techstack,
    type,
    amount: amount || 5,
  });

  const questionsText = await generateTextWithRetry({ prompt });

  let questions: string[];
  try {
    questions = JSON.parse(questionsText);
  } catch {
    // If JSON parse fails, try to extract from the text
    const match = questionsText.match(/\[[\s\S]*\]/);
    if (match) {
      questions = JSON.parse(match[0]);
    } else {
      throw new ValidationError("Failed to parse generated questions");
    }
  }

  const interview = {
    role,
    type,
    level,
    techstack: techstack.split(",").map((t: string) => t.trim()),
    questions,
    userId: userid,
    finalized: true,
    coverImage: getRandomInterviewCover(),
    createdAt: new Date().toISOString(),
  };

  await db.collection("interviews").add(interview);

  return { success: true };
}

/**
 * Get a single interview by ID.
 */
export async function getInterviewById(
  id: string
): Promise<Interview | null> {
  const doc = await db.collection("interviews").doc(id).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as Interview;
}

/**
 * Get all interviews for a specific user.
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  if (!userId) return [];

  const snapshot = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/**
 * Get latest interviews available to take (excluding the user's own).
 */
export async function getLatestInterviews(params: {
  userId: string;
  limit?: number;
}): Promise<Interview[]> {
  const { userId, limit = 20 } = params;

  if (!userId) return [];

  const snapshot = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  // Filter out user's own interviews client-side
  // (Firestore doesn't support != queries combined with orderBy efficiently)
  return snapshot.docs
    .filter((doc) => doc.data().userId !== userId)
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
}
