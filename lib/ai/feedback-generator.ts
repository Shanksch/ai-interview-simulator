import { buildFeedbackPrompt } from "./prompt-builder";
import { generateObjectWithRetry } from "./llm-client";
import { feedbackSchema } from "@/constants/schemas";
import { AIError } from "@/lib/errors";

interface GenerateFeedbackParams {
  transcript: { role: string; content: string }[];
  role?: string;
  techstack?: string[];
}

/**
 * Generate structured interview feedback from a transcript.
 *
 * Pipeline: transcript → prompt builder → LLM (Gemini) → Zod validation → Feedback object
 */
export async function generateInterviewFeedback(
  params: GenerateFeedbackParams
): Promise<{
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}> {
  const { transcript, role, techstack } = params;

  if (!transcript.length) {
    throw new AIError("Cannot generate feedback from empty transcript");
  }

  const prompt = buildFeedbackPrompt({ transcript, role, techstack });

  const feedback = await generateObjectWithRetry({
    prompt,
    schema: feedbackSchema,
    model: "gemini-2.0-flash-001",
    timeoutMs: 45_000,
  });

  return feedback;
}
