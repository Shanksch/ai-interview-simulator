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
  type: string;
}

/** Build dynamic variables for the interviewer agent */
export function buildInterviewerVariables(context: InterviewContext) {
  return {
    questions_json: JSON.stringify(context.questions),
    user_name: context.userName,
    role: context.role,
    level: context.level,
    techstack: context.techstack.join(", "),
    type: context.type,
  };
}
