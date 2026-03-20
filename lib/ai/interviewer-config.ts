/**
 * ElevenLabs agent configuration for the interview system.
 *
 * Agents are created and configured on the ElevenLabs dashboard.
 * This module provides helper functions for dynamic variable
 * injection used during voice interview sessions.
 */

export interface InterviewContext {
  questions: string[];
  userName: string;
  role: string;
  level: string;
  techstack: string[];
}

/** Build dynamic variables for the interviewer agent */
export function buildInterviewerVariables(context: InterviewContext) {
  const formattedQuestions = context.questions.map((q) => `- ${q}`).join("\n");
  return {
    questions: formattedQuestions,
    user_name: context.userName,
    role: context.role,
    level: context.level,
    techstack: context.techstack.join(", "),
  };
}
