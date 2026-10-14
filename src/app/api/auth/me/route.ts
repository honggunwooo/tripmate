import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabaseSchema, getDatabase } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  const sql = getDatabase();
  if (!sql) return NextResponse.json({ error: "Neon 데이터베이스가 아직 연결되지 않았어요." }, { status: 503 });
  try {
    await ensureDatabaseSchema(sql);
    return NextResponse.json({ user: await getSessionUser(sql) });
  } catch {
    return NextResponse.json({ error: "로그인 상태를 확인하지 못했어요." }, { status: 500 });
  }
}
