/**
 * Constants barrel file — re-exports from focused modules.
 * The Vapi interviewer config has been removed (now managed via ElevenLabs dashboard).
 */

export { mappings } from "./mappings";
export { feedbackSchema } from "./schemas";
export { interviewCovers } from "./interview-covers";

/** Dummy interviews for development/testing */
export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2026-03-14T15:30:00Z",
  },
];