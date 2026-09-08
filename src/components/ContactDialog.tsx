"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ContactDialogProps = {
  userEmail: string | null;
};

export function ContactDialog({ userEmail }: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Contato
      </button>
      {open ? (
        <ContactModal
          titleId={titleId}
          userEmail={userEmail}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function ContactModal({
  titleId,
  userEmail,
  onClose,
}: {
  titleId: string;
  userEmail: string | null;
  onClose: () => void;
}) {
  const loggedIn = Boolean(userEmail);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current
      ?.querySelector<HTMLElement>("input, textarea")
      ?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [mounted, onClose]);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          loggedIn ? { message } : { name, email, message },
        ),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel enviar a mensagem");
      }
      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nao foi possivel enviar a mensagem",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#083f37]/45 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Fale com a gente
        </p>
        <h2
          id={titleId}
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
        >
          Contato
        </h2>

        {sent ? (
          <div className="mt-6">
            <p className="text-[#3d5c56]">
              Mensagem enviada. Respondemos no seu e-mail.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#0F6B5C] px-5 py-3 text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            {loggedIn ? (
              <p className="text-sm text-[#3d5c56]">
                Respondemos em {userEmail}.
              </p>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-[#3d5c56]">
                    Nome
                  </span>
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#0F6B5C]/15 px-4 py-3"
                    placeholder="Seu nome"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#3d5c56]">
                    E-mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[#0F6B5C]/15 px-4 py-3"
                    placeholder="seu@email.com"
                  />
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-medium text-[#3d5c56]">
                Mensagem
              </span>
              <textarea
                required
                minLength={8}
                maxLength={4000}
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-2 w-full resize-y rounded-xl border border-[#0F6B5C]/15 px-4 py-3"
                placeholder="Como a gente pode ajudar?"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#0F6B5C] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-[#0F6B5C]/20 px-5 py-3 text-sm font-semibold text-[#0F6B5C]"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
