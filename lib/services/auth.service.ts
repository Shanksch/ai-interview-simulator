"use server";

import { cookies } from "next/headers";
import { db, auth } from "@/firebase/admin";
import { AuthError } from "@/lib/errors";

const SESSION_COOKIE_NAME = "__session";
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000; // 5 days

/**
 * Create a session cookie from a Firebase ID token.
 */
export async function createSession(idToken: string): Promise<void> {
  try {
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("Failed to create session:", error);
    throw new AuthError("Failed to create session");
  }
}

/**
 * Verify the current session cookie and return decoded claims.
 * Returns null if no session or invalid session.
 */
export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) return null;

  try {
    return await auth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

/**
 * Store a new user document in Firestore.
 */
export async function createUser(params: {
  uid: string;
  name: string;
  email: string;
}): Promise<void> {
  const { uid, name, email } = params;

  // Check if user already exists
  const existingUser = await db.collection("users").doc(uid).get();
  if (existingUser.exists) return;

  await db.collection("users").doc(uid).set({
    name,
    email,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get a user by their UID from Firestore.
 */
export async function getUserById(uid: string): Promise<User | null> {
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) return null;

  return {
    id: doc.id,
    ...doc.data(),
  } as User;
}

/**
 * Destroy the current session (sign out).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
