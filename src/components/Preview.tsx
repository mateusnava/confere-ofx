"use client";

import { useEffect, useState } from "react";
import { balanceGapLabel, type BalanceCheck } from "@/lib/balance";
import {
  EXPORT_FILENAMES,
  exportErrorMessage,
  exportUrl,
  filenameFromDisposition,
  type ExportFormat,
} from "@/lib/export/client";
import {
  formatRemainingSession,
  remainingSessionMs,
  SESSION_EXPIRED_COPY,
} from "@/lib/session";
import type { Statement } from "@/lib/statement";

type PreviewProps = {
  statement: Statement;
  balance: BalanceCheck;
  sessionId: string;
  expiresAt: string;
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

const BANK_LABELS: Record<string, string> = {
  nubank: "Nubank",
  inter: "Inter",
  itau: "Itaú",
  bradesco: "Bradesco",
  bb: "Banco do Brasil",
  santander: "Santander",
  c6: "C6",
  caixa: "Caixa",
  other: "Banco não identificado",
  unknown: "Banco não identificado",
};

function bankLabel(bank: string) {
  const key = bank.trim().toLowerCase();
  if (!key) return BANK_LABELS.other;
  return BANK_LABELS[key] ?? bank;
}

export function Preview({
  statement,
  balance,
  sessionId,
  expiresAt,
}: PreviewProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [forcedExpired, setForcedExpired] = useState(false);
  const [trackedExpiresAt, setTrackedExpiresAt] = useState(expiresAt);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);

  if (trackedExpiresAt !== expiresAt) {
    setTrackedExpiresAt(expiresAt);
    setForcedExpired(false);
  }
  const remainingMs = forcedExpired ? 0 : remainingSessionMs(expiresAt, now);
  const expired = remainingMs <= 0;
  const canDownloadOfx = !expired && (balance.ok || acknowledged);

  useEffect(() => {
    const id = window.setInterval(() => {
      const nextNow = Date.now();
      setNow(nextNow);
      if (remainingSessionMs(expiresAt, nextNow) <= 0) {
        window.clearInterval(id);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  async function download(format: ExportFormat) {
    if (expired) {
      setDownloadError(SESSION_EXPIRED_COPY);
      return;
    }

    setDownloading(format);
    setDownloadError(null);

    try {
      const response = await fetch(
        exportUrl(sessionId, format, !balance.ok),
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        if (response.status === 404) {
          setForcedExpired(true);
        }
        setDownloadError(exportErrorMessage(response.status, body));
        return;
      }

      const blob = await response.blob();
      const filename = filenameFromDisposition(
        response.headers.get("Content-Disposition"),
        EXPORT_FILENAMES[format],
      );
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setDownloadError("Nao foi possivel baixar");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Conferência do extrato
          </h2>
          <p className="text-sm text-slate-500">
            {bankLabel(statement.bank)} · {statement.kind}
          </p>
          <p
            className={`mt-1 text-sm ${
              expired ? "text-red-600" : "text-slate-500"
            }`}
          >
            {formatRemainingSession(remainingMs)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            balance.ok
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {balance.ok ? "Saldo fecha" : "Saldo nao fecha"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Abertura</p>
          <p className="mt-1 font-medium">
            {statement.openingBalanceCents !== undefined
              ? formatMoney(statement.openingBalanceCents)
              : "-"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Soma</p>
          <p className="mt-1 font-medium">{formatMoney(balance.sumCents)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Fechamento</p>
          <p className="mt-1 font-medium">
            {statement.closingBalanceCents !== undefined
              ? formatMoney(statement.closingBalanceCents)
              : "-"}
          </p>
        </div>
      </div>

      {balance.ok ? null : (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">
            {balanceGapLabel(balance)}. Revise antes de importar no sistema do
            contador.
          </p>
          <label className="mt-3 flex items-start gap-2">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-0.5"
            />
            <span>Entendi que o saldo nao fecha</span>
          </label>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Descricao</th>
              <th className="py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {statement.transactions.map((tx) => (
              <tr key={`${tx.date}-${tx.description}-${tx.amountCents}`} className="border-b border-slate-100">
                <td className="py-2 pr-4">{formatDate(tx.date)}</td>
                <td className="py-2 pr-4">{tx.description}</td>
                <td className="py-2">{formatMoney(tx.amountCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {downloadError ? (
        <p className="mt-6 text-sm text-red-600">{downloadError}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {canDownloadOfx ? (
          <button
            type="button"
            disabled={downloading !== null}
            onClick={() => void download("ofx")}
            className="rounded-full bg-[#0F6B5C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {balance.ok ? "Baixar OFX" : "Baixar OFX mesmo assim"}
          </button>
        ) : (
          <span className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
            {balance.ok ? "Baixar OFX" : "Baixar OFX mesmo assim"}
          </span>
        )}
        {expired ? (
          <>
            <span className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
              Baixar CSV
            </span>
            <span className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
              Baixar Excel
            </span>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={downloading !== null}
              onClick={() => void download("csv")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              Baixar CSV
            </button>
            <button
              type="button"
              disabled={downloading !== null}
              onClick={() => void download("xlsx")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              Baixar Excel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
