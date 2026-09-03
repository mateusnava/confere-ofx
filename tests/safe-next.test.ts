import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/safe-next";

const origin = "https://confere.test";

describe("safeNextPath", () => {
  it("aceita caminho same-origin", () => {
    expect(safeNextPath("/pdf-para-ofx", origin)).toBe("/pdf-para-ofx");
    expect(safeNextPath("/comprar?pack=1", origin)).toBe("/comprar?pack=1");
  });

  it("rejeita protocolo relativo e barra invertida", () => {
    expect(safeNextPath("//evil.com", origin)).toBe("/perfil");
    expect(safeNextPath("/\\evil.com", origin)).toBe("/perfil");
    expect(safeNextPath("https://evil.com", origin)).toBe("/perfil");
  });

  it("volta ao fallback se next estiver vazio", () => {
    expect(safeNextPath(undefined, origin)).toBe("/perfil");
    expect(safeNextPath("", origin)).toBe("/perfil");
  });
});
