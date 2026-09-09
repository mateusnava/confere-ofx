"use client";

import { useEffect, useState } from "react";

type ConvertProgressProps = {
  phase: "upload" | "convert";
};

const STEPS = [
  "Recebendo arquivo",
  "Lendo documento",
  "Extraindo lançamentos",
  "Conferindo saldo",
  "Gerando OFX",
] as const;

export function ConvertProgress({ phase }: ConvertProgressProps) {
  return <ConvertProgressSteps key={phase} phase={phase} />;
}

function ConvertProgressSteps({ phase }: ConvertProgressProps) {
  const [stepIndex, setStepIndex] = useState(phase === "upload" ? 0 : 1);

  useEffect(() => {
    if (phase === "upload") {
      return;
    }

    const interval = window.setInterval(() => {
      setStepIndex((current) =>
        current >= STEPS.length - 1 ? current : current + 1,
      );
    }, 2200);
    return () => window.clearInterval(interval);
  }, [phase]);

  return (
    <div
      className="convert-progress overflow-hidden rounded-2xl border border-[#0F6B5C]/15 bg-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center justify-between border-b border-[#0F6B5C]/10 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Processando extrato
        </p>
        <span className="convert-progress-dot h-2 w-2 rounded-full bg-[#0F6B5C]" />
      </div>

      <ol className="px-5 py-5">
        {STEPS.map((label, index) => {
          const state =
            index < stepIndex
              ? "done"
              : index === stepIndex
                ? "current"
                : "pending";

          return (
            <li key={label} className="flex gap-3">
              <div className="flex w-5 shrink-0 flex-col items-center">
                <span
                  className={
                    state === "pending"
                      ? "grid h-5 w-5 place-items-center rounded-full border border-[#0F6B5C]/25 text-[10px] font-semibold text-[#6b8a84]"
                      : state === "current"
                        ? "convert-progress-current grid h-5 w-5 place-items-center rounded-full bg-[#0F6B5C] text-[10px] font-semibold text-[#f4fbf9]"
                        : "grid h-5 w-5 place-items-center rounded-full bg-[#0F6B5C] text-[10px] font-bold text-[#f4fbf9]"
                  }
                >
                  {state === "done" ? "✓" : index + 1}
                </span>
                {index < STEPS.length - 1 ? (
                  <span
                    className={
                      state === "done"
                        ? "w-px flex-1 bg-[#0F6B5C]/40"
                        : "w-px flex-1 bg-[#0F6B5C]/12"
                    }
                  />
                ) : null}
              </div>
              <p
                className={`${index < STEPS.length - 1 ? "pb-4" : ""} ${
                  state === "pending"
                    ? "text-sm text-[#6b8a84]"
                    : state === "current"
                      ? "text-sm font-medium text-[#0F6B5C]"
                      : "text-sm text-[#3d5c56]"
                }`}
              >
                {label}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-[#0F6B5C]/10 px-5 py-3">
        <p className="text-sm text-[#0F6B5C]">{STEPS[stepIndex]}...</p>
        <p className="mt-1 text-xs text-[#6b8a84]">
          O arquivo é excluído automaticamente em 60 segundos.
        </p>
      </div>
    </div>
  );
}
