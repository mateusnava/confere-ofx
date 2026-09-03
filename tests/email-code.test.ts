import { describe, expect, it } from "vitest";
import { codesMatch, hashEmailCode } from "@/lib/auth/email-code";

describe("email-code", () => {
  it("gera o mesmo hash para o mesmo email e codigo", () => {
    const left = hashEmailCode("a@b.com", "123456");
    const right = hashEmailCode("a@b.com", "123456");
    expect(codesMatch(left, right)).toBe(true);
  });

  it("rejeita codigo diferente", () => {
    const expected = hashEmailCode("a@b.com", "123456");
    const other = hashEmailCode("a@b.com", "000000");
    expect(codesMatch(expected, other)).toBe(false);
  });
});
