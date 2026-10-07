export const maxDuration = 30;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "서버에 GEMINI_API_KEY가 설정되지 않았어요." },
      { status: 500 }
    );
  }

  let body: { city?: string; days?: number; taste?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const city = (body.city ?? "").trim().slice(0, 50);
  const taste = (body.taste ?? "").trim().slice(0, 100);
  const days = Math.min(Math.max(Number(body.days) || 1, 1), 5);

  if (!city) {
    return Response.json({ error: "도시를 입력해 주세요." }, { status: 400 });
  }

  const prompt = `${city} ${days}일 여행 일정을 짜줘. 취향: ${taste || "특별한 취향 없음"}.
규칙:
- 하루에 4~5곳, 이동 동선이 효율적이도록 가까운 곳끼리 묶어서 순서대로.
- 실제로 존재하는 유명한 장소만.
- 장소 이름은 한국어(현지 고유명사는 원어 병기 가능).
- lat, lng는 해당 장소의 대략적인 위도/경도(소수점 4자리 이상).
- description은 한국어로 한 문장.`;

  const schema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      days: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            day: { type: "INTEGER" },
            places: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  description: { type: "STRING" },
                  lat: { type: "NUMBER" },
                  lng: { type: "NUMBER" },
                },
                required: ["name", "description", "lat", "lng"],
              },
            },
          },
          required: ["day", "places"],
        },
      },
    },
    required: ["title", "days"],
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return Response.json(
        { error: data?.error?.message ?? "Gemini 호출에 실패했어요." },
        { status: 502 }
      );
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return Response.json(
        { error: "Gemini가 빈 응답을 보냈어요. 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    return Response.json(JSON.parse(text));
  } catch {
    return Response.json(
      { error: "일정을 생성하는 중 오류가 발생했어요." },
      { status: 500 }
    );
  }
}
