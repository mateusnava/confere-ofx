"use client";

import { useState } from "react";
import { ConvertProgress } from "@/components/ConvertProgress";
import { Dropzone } from "@/components/Dropzone";
import { Preview } from "@/components/Preview";
import { SubscribeWall } from "@/components/SubscribeWall";
import type { BalanceCheck } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

type ConvertResponse = {
  sessionId: string;
  statement: Statement;
  balance: BalanceCheck;
  expiresAt: string;
};

type SubscriptionRequiredResponse = {
  error: "subscription_required";
  reason?: "daily_free_used" | "plan_limit_exceeded" | "subscription_required";
};

export default function PdfParaOfxPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [subscriptionRequired, setSubscriptionRequired] =
    useState<SubscriptionRequiredResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function convert(payload: { blobUrl: string; mimeType: string }) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blobUrl: payload.blobUrl,
          mimeType: payload.mimeType,
          password: password || undefined,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        setSubscriptionRequired(data as SubscriptionRequiredResponse);
        setResult(null);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Erro na conversao");
      }

      setResult(data as ConvertResponse);
      setSubscriptionRequired(null);
    } catch (convertError) {
      setError(
        convertError instanceof Error ? convertError.message : "Erro na conversao",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4fbf9] text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F6B5C]">
            Confere OFX
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            PDF vira OFX. So sai se o saldo fechar.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Converta extratos bancarios brasileiros para OFX, Excel ou CSV.
            Extracao feita por IA (Gemini).
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <Dropzone
            disabled={loading}
            onBusyChange={setUploading}
            onUploaded={(payload) => void convert(payload)}
          />

          <label className="block max-w-md">
            <span className="text-sm font-medium text-slate-700">
              Senha do PDF (se houver)
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2"
              placeholder="Opcional"
            />
          </label>

          {uploading || loading ? (
            <ConvertProgress phase={uploading ? "upload" : "convert"} />
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {subscriptionRequired ? (
            <SubscribeWall reason={subscriptionRequired.reason} />
          ) : null}

          {result ? (
            <Preview
              statement={result.statement}
              balance={result.balance}
              sessionId={result.sessionId}
            />
          ) : null}
        </div>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            ["Gratis", "1 consulta por IP/dia"],
            ["Pro", "R$ 19,90/mes · 1.000 paginas"],
            ["Escritorio", "R$ 69/mes · 8.000 paginas"],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F6B5C]">{title}</h2>
              <p className="mt-2 text-sm text-slate-600">{copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
