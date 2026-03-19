/**
 * ElevenLabs agent configuration for the interview system.
 *
 * Agents are created and configured on the ElevenLabs dashboard.
 * This module provides the agent IDs and helper functions for
 * dynamic variable injection and session overrides.
 */

/** Get the ElevenLabs Agent ID for interview generation (collects params via voice) */
export function getGeneratorAgentId(): string {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_GENERATOR;
  if (!agentId) {
    throw new Error("NEXT_PUBLIC_ELEVENLABS_AGENT_ID_GENERATOR is not set");
  }
  return agentId;
}

/** Get the ElevenLabs Agent ID for conducting interviews */
export function getInterviewerAgentId(): string {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_INTERVIEWER;
  if (!agentId) {
    throw new Error("NEXT_PUBLIC_ELEVENLABS_AGENT_ID_INTERVIEWER is not set");
  }
  return agentId;
}

/** Build dynamic variables for the interview generator agent */
export function buildGeneratorVariables(userName: string, userId: string) {
  return {
    user_name: userName,
    user_id: userId,
  };
}

/** Build dynamic variables for the interviewer agent */
export function buildInterviewerVariables(questions: string[]) {
  const formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
  return {
    questions: formattedQuestions,
  };
}
