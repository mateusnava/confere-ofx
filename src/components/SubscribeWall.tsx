"use client";

import { useState } from "react";
import { PLAN_PRICES } from "@/lib/plans";

type SubscribeWallProps = {
  reason?: "daily_free_used" | "plan_limit_exceeded" | "subscription_required";
};

export function SubscribeWall({ reason }: SubscribeWallProps) {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"pro" | "escritorio">("pro");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reasonText =
    reason === "daily_free_used"
      ? "Voce ja usou a consulta gratuita de hoje."
      : reason === "plan_limit_exceeded"
        ? "Voce atingiu o limite mensal do seu plano."
        : "Assine um plano mensal para continuar.";

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Erro ao enviar link");
      }

      setMessage(
        data.magicLink
          ? `Link de acesso (dev): ${data.magicLink}`
          : "Enviamos um link de acesso para seu email. Apos confirmar, seu plano estara ativo.",
      );
    } catch (subscribeError) {
      setError(
        subscribeError instanceof Error
          ? subscribeError.message
          : "Erro ao assinar",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h3 className="text-lg font-semibold text-amber-950">Plano mensal necessario</h3>
      <p className="mt-2 text-sm text-amber-900">{reasonText}</p>
      <p className="mt-1 text-sm text-amber-800">
        Gratis: 1 consulta por IP/dia. Depois disso, assine Pro ou Escritorio.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(["pro", "escritorio"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPlan(option)}
            className={`rounded-xl border p-4 text-left transition ${
              plan === option
                ? "border-[#0F6B5C] bg-white ring-2 ring-[#0F6B5C]/20"
                : "border-amber-200 bg-white/60"
            }`}
          >
            <p className="font-semibold text-slate-900">{PLAN_PRICES[option].label}</p>
            <p className="text-sm text-slate-600">{PLAN_PRICES[option].price}</p>
            <p className="mt-1 text-xs text-slate-500">
              {PLAN_PRICES[option].pages.toLocaleString("pt-BR")} paginas/mes
            </p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="seu@email.com"
          className="flex-1 rounded-xl border border-amber-200 px-4 py-2"
        />
        <button
          type="button"
          onClick={() => void handleSubscribe()}
          disabled={loading || !email}
          className="rounded-full bg-[#0F6B5C] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Assinar plano mensal"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
