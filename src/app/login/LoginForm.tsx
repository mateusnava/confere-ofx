"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true);
    setError(null);
    setDevCode(null);

    try {
      const response = await fetch("/api/auth/email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Nao foi possivel enviar o codigo");
      }
      if (data.code) {
        setDevCode(data.code);
      }
      setStep("code");
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Erro ao enviar codigo",
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmCode() {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("email-code", {
        email,
        code,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error("Codigo invalido ou expirado");
      }

      router.push(
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/perfil",
      );
      router.refresh();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Erro ao entrar",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === "email") {
          void sendCode();
          return;
        }
        void confirmCode();
      }}
    >
      <label className="block">
        <span className="text-sm font-medium text-[#3d5c56]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={step === "code"}
          className="mt-2 w-full rounded-xl border border-[#0F6B5C]/15 px-4 py-3"
          placeholder="seu@email.com"
        />
      </label>

      {step === "code" ? (
        <label className="block">
          <span className="text-sm font-medium text-[#3d5c56]">
            Codigo de 6 digitos
          </span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mt-2 w-full rounded-xl border border-[#0F6B5C]/15 px-4 py-3 tracking-[0.4em]"
            placeholder="000000"
          />
        </label>
      ) : null}

      {devCode ? (
        <p className="text-sm text-[#0F6B5C]">Codigo (dev): {devCode}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || (step === "code" && code.length !== 6)}
        className="w-full rounded-full bg-[#0F6B5C] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading
          ? "Aguarde..."
          : step === "email"
            ? "Enviar codigo"
            : "Entrar"}
      </button>

      {step === "code" ? (
        <button
          type="button"
          className="w-full text-sm text-[#3d5c56] underline"
          onClick={() => {
            setStep("email");
            setCode("");
            setDevCode(null);
            setError(null);
          }}
        >
          Usar outro email
        </button>
      ) : null}
    </form>
  );
}
