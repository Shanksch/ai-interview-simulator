"use server";

import { z } from "zod";

const serverSchema = z.object({
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
  NEXT_PUBLIC_ELEVENLABS_AGENT_ID_GENERATOR: z.string().optional(),
  NEXT_PUBLIC_ELEVENLABS_AGENT_ID_INTERVIEWER: z.string().optional(),
});

/** Server-side environment variables — only use in server components/actions/routes */
export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Missing required server environment variables");
  }
  return parsed.data;
}

/** Client-side environment variables — safe to use anywhere */
export function getClientEnv() {
  const parsed = clientSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Missing required client environment variables");
  }
  return parsed.data;
}
