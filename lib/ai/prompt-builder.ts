interface QuestionGenerationParams {
  role: string;
  level: string;
  techstack: string;
  type: string;
  amount: number;
}

interface FeedbackPromptParams {
  transcript: { role: string; content: string }[];
  role?: string;
  techstack?: string[];
}

/**
 * Build the prompt used by Gemini to generate interview questions.
 * Designed for voice-assistant compatibility: no special characters.
 */
export function buildQuestionGenerationPrompt(params: QuestionGenerationParams): string {
  const { role, level, techstack, type, amount } = params;

  return `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${techstack}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]`;
}

/**
 * Build the prompt used to evaluate an interview transcript and generate feedback.
 * Returns structured JSON matching the feedbackSchema.
 */
export function buildFeedbackPrompt(params: FeedbackPromptParams): string {
  const { transcript, role, techstack } = params;

  const transcriptText = transcript
    .map((t) => `${t.role === "user" ? "Candidate" : "Interviewer"}: ${t.content}`)
    .join("\n");

  return `You are an expert interview evaluator. Analyze the following interview transcript and provide detailed, constructive feedback.

${role ? `The candidate was interviewing for the role of: ${role}` : ""}
${techstack?.length ? `The relevant tech stack: ${techstack.join(", ")}` : ""}

Interview Transcript:
---
${transcriptText}
---

Evaluate the candidate across these five categories, scoring each from 0 to 100:
1. Communication Skills — clarity, articulation, structure of responses
2. Technical Knowledge — depth and accuracy of technical answers
3. Problem Solving — analytical thinking, approach to challenges
4. Cultural Fit — teamwork, values alignment, adaptability
5. Confidence and Clarity — poise, directness, conviction in answers

Provide your evaluation as JSON with this exact structure:
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    { "name": "Communication Skills", "score": <number>, "comment": "<specific feedback>" },
    { "name": "Technical Knowledge", "score": <number>, "comment": "<specific feedback>" },
    { "name": "Problem Solving", "score": <number>, "comment": "<specific feedback>" },
    { "name": "Cultural Fit", "score": <number>, "comment": "<specific feedback>" },
    { "name": "Confidence and Clarity", "score": <number>, "comment": "<specific feedback>" }
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "finalAssessment": "<2-3 sentence overall assessment>"
}

Be specific in your comments — reference actual things the candidate said. Be constructive and encouraging while being honest about areas for improvement.`;
}

/**
 * Build the system prompt for the ElevenLabs Interviewer agent.
 * Questions are injected via the {{questions}} dynamic variable.
 */
export function buildInterviewerSystemPrompt(): string {
  return `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.

Be professional, yet warm and welcoming:
Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing — sound natural and conversational.

Answer the candidate's questions professionally:
If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.

Be sure to be professional and polite.
Keep all your responses short and simple. Use official language, but be kind and welcoming.
This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`;
}
