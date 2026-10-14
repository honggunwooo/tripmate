import { hash } from "bcryptjs";
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해 주세요." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: "비밀번호는 8자 이상 72자 이하로 입력해 주세요." }, { status: 400 });
    }

    await ensureDatabaseSchema(sql);
    const passwordHash = await hash(password, 10);
    const [user] = await sql`
      INSERT INTO users (email, password_hash) VALUES (${email}, ${passwordHash})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `;
    if (!user) return NextResponse.json({ error: "이미 가입된 이메일이에요. 로그인해 주세요." }, { status: 409 });

    const token = await createSession(sql, user.id);
    const response = NextResponse.json({ user: { id: user.id, email: user.email }, message: "회원가입과 로그인이 완료됐어요." }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "회원가입을 처리하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
}
