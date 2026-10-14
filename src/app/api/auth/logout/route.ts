import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hashSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { ensureDatabaseSchema, getDatabase } from "@/lib/database";

export const runtime = "nodejs";

export async function POST() {
  const sql = getDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  try {
    if (sql && token) {
      await ensureDatabaseSchema(sql);
      await sql`DELETE FROM user_sessions WHERE token_hash = ${hashSessionToken(token)}`;
    }
    const response = NextResponse.json({ message: "로그아웃했어요." });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.json({ error: "로그아웃에 실패했어요." }, { status: 500 });
  }
}
