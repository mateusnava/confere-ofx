export const SESSION_TTL_MS = 15 * 60 * 1000;
export const SESSION_EXPIRED_COPY =
  "O prazo para baixar acabou. Envie o extrato de novo.";

export function remainingSessionMs(
  expiresAt: string,
  now = Date.now(),
): number {
  const expires = Date.parse(expiresAt);
  if (Number.isNaN(expires)) return 0;
  return Math.max(0, expires - now);
}

export function formatRemainingSession(ms: number): string {
  if (ms <= 0) {
    return SESSION_EXPIRED_COPY;
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return totalSeconds === 1
      ? "1 segundo para baixar"
      : `${totalSeconds} segundos para baixar`;
  }

  if (seconds === 0) {
    return minutes === 1 ? "1 minuto para baixar" : `${minutes} minutos para baixar`;
  }

  return `${minutes} min ${seconds} s para baixar`;
}
