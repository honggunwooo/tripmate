import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database";

export const SESSION_COOKIE = "tripmate_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(sql: Database, userId: string) {
  const token = randomBytes(32).toString("base64url");
  await sql`INSERT INTO user_sessions (token_hash, user_id, expires_at)
    VALUES (${hashSessionToken(token)}, ${userId}, now() + interval '30 days')`;
  return token;
}

export async function getSessionUser(sql: Database) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [user] = await sql`
    SELECT users.id, users.email
    FROM user_sessions
    JOIN users ON users.id = user_sessions.user_id
    WHERE user_sessions.token_hash = ${hashSessionToken(token)}
      AND user_sessions.expires_at > now()
  `;
  return user ?? null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
