import { listAvailableGeminiModels } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "서버 환경변수 GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const models = await listAvailableGeminiModels(apiKey);
    return Response.json({ models });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gemini 모델 목록을 확인하는 중 오류가 발생했습니다.",
      },
      { status: 502 }
    );
  }
}
