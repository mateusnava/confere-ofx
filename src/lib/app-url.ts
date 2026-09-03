export function resolveAppBaseUrl(
  appUrl: string | undefined,
  nodeEnv: string | undefined,
): string {
  const configured = appUrl?.trim().replace(/\/$/, "");
  if (configured) {
    return configured;
  }
  if (nodeEnv === "production") {
    throw new Error("APP_URL ausente");
  }
  return "http://localhost:3000";
}

export function appBaseUrl(): string {
  return resolveAppBaseUrl(process.env.APP_URL, process.env.NODE_ENV);
}
