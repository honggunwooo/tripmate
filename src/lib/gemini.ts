export type AvailableGeminiModel = {
  name: string;
  modelId: string;
  displayName: string;
  supportedGenerationMethods: string[];
};

type GeminiModelsResponse = {
  models?: Array<{
    name?: string;
    displayName?: string;
    supportedGenerationMethods?: string[];
  }>;
  nextPageToken?: string;
  error?: { message?: string };
};

export async function listAvailableGeminiModels(
  apiKey: string
): Promise<AvailableGeminiModel[]> {
  const models: AvailableGeminiModel[] = [];
  let pageToken = "";

  do {
    const url = new URL("https://generativelanguage.googleapis.com/v1beta/models");
    url.searchParams.set("pageSize", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { "x-goog-api-key": apiKey },
      cache: "no-store",
    });
    const data = (await response.json()) as GeminiModelsResponse;

    if (!response.ok) {
      throw new Error(
        data.error?.message ?? "Gemini 모델 목록을 가져오지 못했습니다."
      );
    }

    for (const model of data.models ?? []) {
      if (
        !model.name ||
        !model.supportedGenerationMethods?.includes("generateContent")
      ) {
        continue;
      }

      models.push({
        name: model.name,
        modelId: model.name.replace(/^models\//, ""),
        displayName: model.displayName ?? model.name,
        supportedGenerationMethods: model.supportedGenerationMethods,
      });
    }

    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return models;
}
