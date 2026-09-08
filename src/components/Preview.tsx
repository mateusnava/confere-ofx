"use client";

import { useState } from "react";
import { balanceGapLabel, type BalanceCheck } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

type PreviewProps = {
  statement: Statement;
  balance: BalanceCheck;
  sessionId: string;
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

export function Preview({ statement, balance, sessionId }: PreviewProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const ofxHref = `/api/export?sessionId=${sessionId}&format=ofx${
    balance.ok ? "" : "&ack=1"
  }`;

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

      <div className="mt-6 flex flex-wrap gap-3">
        {balance.ok || acknowledged ? (
          <a
            href={ofxHref}
            className="rounded-full bg-[#0F6B5C] px-4 py-2 text-sm font-semibold text-white"
          >
            {balance.ok ? "Baixar OFX" : "Baixar OFX mesmo assim"}
          </a>
        ) : (
          <span className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
            Baixar OFX mesmo assim
          </span>
        )}
        <a
          href={`/api/export?sessionId=${sessionId}&format=csv`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Baixar CSV
        </a>
        <a
          href={`/api/export?sessionId=${sessionId}&format=xlsx`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Baixar Excel
        </a>
      </div>
    </div>
  );
}
