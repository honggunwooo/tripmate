import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabaseSchema, getDatabase } from "@/lib/database";

export const runtime = "nodejs";

type TripInput = { title?: unknown; city?: unknown; days?: unknown; taste?: unknown; plan?: unknown };

function databaseMissing() {
  return NextResponse.json(
    { error: "Neon DB가 아직 연결되지 않았어요. Vercel 프로젝트에 Neon을 연결해 주세요." },
    { status: 503 },
  );
}

export async function GET() {
  const sql = getDatabase();
  if (!sql) return databaseMissing();
  try {
    await ensureDatabaseSchema(sql);
    const user = await getSessionUser(sql);
    if (!user) return NextResponse.json({ error: "일정을 보려면 로그인해 주세요." }, { status: 401 });
    const trips = await sql`SELECT id, title, city, days, taste, plan, created_at FROM trips WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    return NextResponse.json({ trips });
  } catch {
    return NextResponse.json({ error: "여행 기록을 불러오지 못했어요. DB 연결 설정을 확인해 주세요." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sql = getDatabase();
  if (!sql) return databaseMissing();
  try {
    await ensureDatabaseSchema(sql);
    const user = await getSessionUser(sql);
    if (!user) return NextResponse.json({ error: "일정을 저장하려면 로그인해 주세요." }, { status: 401 });
    const body = (await request.json()) as TripInput;
    if (
      typeof body.title !== "string" || !body.title.trim() ||
      typeof body.city !== "string" || !body.city.trim() ||
      typeof body.days !== "number" || !Number.isInteger(body.days) || body.days < 1 || body.days > 5 ||
      !body.plan || typeof body.plan !== "object" || Array.isArray(body.plan)
    ) return NextResponse.json({ error: "여행 일정 정보가 올바르지 않아요." }, { status: 400 });

    const [trip] = await sql`
      INSERT INTO trips (user_id, title, city, days, taste, plan)
      VALUES (${user.id}, ${body.title.trim()}, ${body.city.trim()}, ${body.days}, ${typeof body.taste === "string" ? body.taste : ""}, ${JSON.stringify(body.plan)}::jsonb)
      RETURNING id, title, city, days, taste, plan, created_at
    `;
    return NextResponse.json({ trip }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "여행 일정을 저장하지 못했어요. DB 연결 설정을 확인해 주세요." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const sql = getDatabase();
  if (!sql) return databaseMissing();
  try {
    await ensureDatabaseSchema(sql);
    const user = await getSessionUser(sql);
    if (!user) return NextResponse.json({ error: "일정을 삭제하려면 로그인해 주세요." }, { status: 401 });
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)) {
      return NextResponse.json({ error: "삭제할 여행 기록을 찾을 수 없어요." }, { status: 400 });
    }
    const deleted = await sql`DELETE FROM trips WHERE id = ${body.id} AND user_id = ${user.id} RETURNING id`;
    if (deleted.length === 0) return NextResponse.json({ error: "해당 일정이 없거나 삭제 권한이 없어요." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "여행 일정을 삭제하지 못했어요. DB 연결 설정을 확인해 주세요." }, { status: 500 });
  }
}
