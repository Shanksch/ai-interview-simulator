import { generateObjectWithRetry } from "@/lib/ai/llm-client";
import { z } from "zod";

const interviewParamsSchema = z.object({
  role: z.string().describe("The job role the candidate is preparing for"),
  level: z
    .string()
    .describe("Experience level: junior, mid, senior, or lead"),
  techstack: z
    .string()
    .describe("Comma-separated list of technologies discussed"),
  type: z
    .string()
    .describe("Interview type: technical, behavioural, or mixed"),
  amount: z
    .number()
    .int()
    .min(1)
    .max(20)
    .describe("Number of questions requested"),
});

export type InterviewParams = z.infer<typeof interviewParamsSchema>;

/**
 * Extract structured interview parameters from a conversation transcript.
 * Used when the Generator agent finishes collecting requirements from the user.
 */
export async function extractInterviewParams(
  transcript: { role: string; content: string }[]
): Promise<InterviewParams> {
  const transcriptText = transcript
    .map(
      (t) =>
        `${t.role === "user" ? "User" : "Agent"}: ${t.content}`
    )
    .join("\n");

  const result = await generateObjectWithRetry({
    prompt: `You are analyzing a conversation between an AI assistant and a user who wants to set up an interview practice session.

Extract the interview parameters from this conversation transcript. If a value was not explicitly mentioned, use reasonable defaults.

Defaults:
- role: "General" if not specified
- level: "mid" if not specified  
- techstack: "general" if not specified
- type: "mixed" if not specified
- amount: 5 if not specified

Conversation transcript:
---
${transcriptText}
---

Extract the interview parameters as structured data.`,
    schema: interviewParamsSchema,
    model: "gemini-2.0-flash-001",
  });

  return result;
}
