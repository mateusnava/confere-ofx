export const CONTACT_TO = "nava.mateus@gmail.com";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseContactInput(
  body: ContactBody,
  sessionEmail?: string | null,
): { ok: true; data: ContactPayload } | { ok: false; error: string } {
  const message = asTrimmed(body.message);
  if (message.length < 8) {
    return { ok: false, error: "Escreva uma mensagem" };
  }
  if (message.length > 4000) {
    return { ok: false, error: "Mensagem longa demais" };
  }

  const loggedEmail = sessionEmail?.trim().toLowerCase() ?? "";
  if (loggedEmail && EMAIL_RE.test(loggedEmail)) {
    return {
      ok: true,
      data: {
        name: loggedEmail,
        email: loggedEmail,
        message,
      },
    };
  }

  const name = asTrimmed(body.name);
  const email = asTrimmed(body.email).toLowerCase();

  if (name.length < 2) {
    return { ok: false, error: "Nome obrigatorio" };
  }
  if (name.length > 120) {
    return { ok: false, error: "Nome longo demais" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Email obrigatorio" };
  }

  return { ok: true, data: { name, email, message } };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function contactEmailHtml(data: ContactPayload): string {
  const message = escapeHtml(data.message).replaceAll("\n", "<br>");
  return [
    `<p><strong>Nome:</strong> ${escapeHtml(data.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>`,
    `<p><strong>Mensagem:</strong></p>`,
    `<p>${message}</p>`,
  ].join("");
}
