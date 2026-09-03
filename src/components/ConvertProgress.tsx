"use client";

import { useEffect, useState } from "react";

type ConvertProgressProps = {
  phase: "upload" | "convert";
};

const CONVERT_MESSAGES = [
  "Lendo as linhas do extrato...",
  "Separando Pix de boleto...",
  "Somando crédito e débito...",
  "Conferindo se o saldo fecha...",
  "Montando o OFX...",
];

const UPLOAD_MESSAGES = [
  "Recebendo o arquivo...",
  "O PDF some em 60 segundos. Combinado.",
];

const LEDGER_ROWS = [
  ["01 SET", "Pix recebido", "+ 50,00"],
  ["02 SET", "Padaria do Bairro", "- 12,40"],
  ["03 SET", "TED salario", "+ 3.200,00"],
  ["04 SET", "Conta de luz", "- 187,90"],
  ["05 SET", "Saldo final", "3.049,70"],
] as const;

export function ConvertProgress({ phase }: ConvertProgressProps) {
  const messages = phase === "upload" ? UPLOAD_MESSAGES : CONVERT_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setMessageIndex(0);
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, [messages.length, phase]);

  return (
    <div
      className="convert-progress overflow-hidden rounded-2xl border border-[#0F6B5C]/15 bg-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center justify-between border-b border-[#0F6B5C]/10 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Conferencia ao vivo
        </p>
        <span className="convert-progress-dot h-2 w-2 rounded-full bg-[#0F6B5C]" />
      </div>

      <div className="relative px-5 py-5">
        <div className="convert-progress-scan pointer-events-none absolute inset-x-5 top-5 h-10 rounded-lg bg-[#0F6B5C]/8" />

        <ul className="relative space-y-2 font-mono text-sm">
          {LEDGER_ROWS.map(([date, label, amount], index) => (
            <li
              key={date}
              className="convert-progress-row flex items-center gap-3 text-[#3d5c56]"
              style={{ animationDelay: `${index * 420}ms` }}
            >
              <span className="convert-progress-check grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0F6B5C] text-[10px] font-bold text-[#f4fbf9]">
                ✓
              </span>
              <span className="w-14 text-xs text-[#6b8a84]">{date}</span>
              <span className="flex-1 truncate">{label}</span>
              <span
                className={
                  amount.startsWith("-")
                    ? "text-[#9a3b2f]"
                    : "text-[#0F6B5C]"
                }
              >
                {amount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-t border-[#0F6B5C]/10 px-5 py-3 text-sm text-[#0F6B5C]">
        {messages[messageIndex]}
      </p>
    </div>
  );
}
