import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { ensureDatabaseSchema, getDatabase } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const sql = getDatabase();
  if (!sql) return NextResponse.json({ error: "Neon 데이터베이스가 아직 연결되지 않았어요." }, { status: 503 });

  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "이메일과 비밀번호를 입력해 주세요." }, { status: 400 });

    await ensureDatabaseSchema(sql);
    const [user] = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
    if (!user || !(await compare(password, user.password_hash))) {
      return NextResponse.json({ error: "이메일 또는 비밀번호를 확인해 주세요." }, { status: 401 });
    }

    await sql`DELETE FROM user_sessions WHERE expires_at <= now()`;
    const token = await createSession(sql, user.id);
    const response = NextResponse.json({ user: { id: user.id, email: user.email }, message: "로그인됐어요." });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "로그인할 수 없어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
