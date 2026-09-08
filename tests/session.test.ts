import { describe, expect, it } from "vitest";
import {
  formatRemainingSession,
  remainingSessionMs,
  SESSION_EXPIRED_COPY,
  SESSION_TTL_MS,
} from "@/lib/session";

describe("session ttl", () => {
  it("vale 15 minutos", () => {
    expect(SESSION_TTL_MS).toBe(15 * 60 * 1000);
  });

  it("conta o tempo ate expirar", () => {
    const now = Date.parse("2026-09-08T16:00:00.000Z");
    const expiresAt = "2026-09-08T16:15:00.000Z";
    expect(remainingSessionMs(expiresAt, now)).toBe(SESSION_TTL_MS);
  });

  it("zera depois do prazo", () => {
    const now = Date.parse("2026-09-08T16:16:00.000Z");
    const expiresAt = "2026-09-08T16:15:00.000Z";
    expect(remainingSessionMs(expiresAt, now)).toBe(0);
    expect(formatRemainingSession(0)).toBe(SESSION_EXPIRED_COPY);
  });

  it("formata minutos e segundos restantes", () => {
    expect(formatRemainingSession(90_000)).toBe("1 min 30 s para baixar");
    expect(formatRemainingSession(60_000)).toBe("1 minuto para baixar");
    expect(formatRemainingSession(1_000)).toBe("1 segundo para baixar");
  });
});
