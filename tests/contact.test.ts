import { describe, expect, it } from "vitest";
import {
  contactEmailHtml,
  parseContactInput,
} from "@/lib/contact";

describe("parseContactInput", () => {
  it("visitante precisa de nome, email e mensagem", () => {
    const parsed = parseContactInput({
      name: "Ana",
      email: "ana@exemplo.com",
      message: "Quero converter um extrato.",
    });
    expect(parsed).toEqual({
      ok: true,
      data: {
        name: "Ana",
        email: "ana@exemplo.com",
        message: "Quero converter um extrato.",
      },
    });
  });

  it("visitante sem email falha", () => {
    const parsed = parseContactInput({
      name: "Ana",
      message: "Quero converter um extrato.",
    });
    expect(parsed.ok).toBe(false);
  });

  it("logado so precisa da mensagem e ignora email do body", () => {
    const parsed = parseContactInput(
      {
        name: "Outro",
        email: "fake@exemplo.com",
        message: "Ja tenho conta e uma duvida.",
      },
      "nava.mateus@gmail.com",
    );
    expect(parsed).toEqual({
      ok: true,
      data: {
        name: "nava.mateus@gmail.com",
        email: "nava.mateus@gmail.com",
        message: "Ja tenho conta e uma duvida.",
      },
    });
  });

  it("rejeita mensagem curta", () => {
    const parsed = parseContactInput(
      { message: "oi" },
      "ana@exemplo.com",
    );
    expect(parsed.ok).toBe(false);
  });
});

describe("contactEmailHtml", () => {
  it("escapa html da mensagem", () => {
    const html = contactEmailHtml({
      name: "Ana",
      email: "ana@exemplo.com",
      message: "<script>alert(1)</script>\nsegunda linha",
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<br>");
    expect(html).not.toContain("<script>");
  });
});
