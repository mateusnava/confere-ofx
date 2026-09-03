import { createGoogle } from "@ai-sdk/google";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return apiKey;
}

export function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
}

export function getGeminiModel() {
  const google = createGoogle({
    apiKey: getGeminiApiKey(),
  });

  // Interactions API — required for gemini-3.x on contas novas.
  return google.interactions(getGeminiModelId());
}
