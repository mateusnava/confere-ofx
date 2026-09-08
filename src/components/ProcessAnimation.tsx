"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import "./ProcessAnimation.css";

function cssVars(vars: Record<`--${string}`, string | number | undefined>): CSSProperties {
  return vars as CSSProperties;
}

export type ProcessMode = "pdf" | "photo";

export type ProcessAnimationTheme = {
  paper?: string;
  ink?: string;
  accent?: string;
  stamp?: string;
};

const TRANSACTIONS = [
  { date: "01/03", memo: "PIX Recebido", hand: "pix maria", amount: "+1.200,00", kind: "in" },
  { date: "05/03", memo: "Aluguel", hand: "aluguel apt", amount: "−1.800,00", kind: "out" },
  { date: "08/03", memo: "Mercado Extra", hand: "extra", amount: "−247,90", kind: "out" },
  { date: "12/03", memo: "PIX Cliente", hand: "cliente joao", amount: "+3.450,00", kind: "in" },
  { date: "18/03", memo: "Conta de luz", hand: "luz", amount: "−186,40", kind: "out" },
] as const;

const STEPS = {
  pdf: [
    "Solta o PDF do banco",
    "Lemos cada lancamento",
    "Montamos o OFX",
    "Abertura + lancamentos fecha",
  ],
  photo: [
    "Manda a foto do caderno",
    "Lemos a letra, mesmo torta",
    "Montamos o OFX",
    "Abertura + lancamentos fecha",
  ],
} as const;

type ProcessAnimationProps = {
  theme?: ProcessAnimationTheme;
  defaultMode?: ProcessMode;
  className?: string;
  showStamp?: boolean;
};

export function ProcessAnimation({
  theme,
  defaultMode = "pdf",
  className = "",
  showStamp = true,
}: ProcessAnimationProps) {
  const labelId = useId();
  const [mode, setMode] = useState<ProcessMode>(defaultMode);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const steps = STEPS[mode];

  return (
    <section
      className={`process-anim ${className}`.trim()}
      data-reduced={reduced ? "true" : "false"}
      style={cssVars({
        "--pa-paper": theme?.paper,
        "--pa-ink": theme?.ink,
        "--pa-accent": theme?.accent,
        "--pa-stamp": theme?.stamp,
      })}
      aria-labelledby={labelId}
    >
      <div className="process-anim__toolbar">
        <div className="process-anim__toggle" role="group" aria-label="Tipo de extrato">
          <button
            type="button"
            aria-pressed={mode === "pdf"}
            onClick={() => setMode("pdf")}
          >
            PDF
          </button>
          <button
            type="button"
            aria-pressed={mode === "photo"}
            onClick={() => setMode("photo")}
          >
            Foto
          </button>
        </div>
        <p id={labelId} className="process-anim__step">
          {steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </p>
      </div>

      <div className="process-anim__stage" key={mode}>
        <div className="process-anim__grid">
          <div className="process-anim__source">
            {mode === "pdf" ? <PdfSource /> : <PhotoSource />}
          </div>
          <div className="process-anim__dest">
            <OfxDest />
          </div>
        </div>
        <div className="process-anim__chips" aria-hidden>
          {TRANSACTIONS.map((tx, index) => (
            <span
              key={`${mode}-${tx.memo}`}
              className="process-anim__chip"
              style={cssVars({ "--i": index })}
            >
              {mode === "photo" ? tx.hand : tx.memo}
              <strong>{tx.amount}</strong>
            </span>
          ))}
        </div>
        {showStamp ? (
          <div className="process-anim__stamp" aria-hidden>
            <span>
              <strong>Conferido</strong>
              <small>Saldo fecha</small>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PdfSource() {
  return (
    <article className="process-anim__pdf" aria-label="Extrato em PDF">
      <div className="process-anim__pdf-bar">
        <span>Banco Inter</span>
        <span>PDF</span>
      </div>
      <div className="process-anim__pdf-meta">
        <span>Extrato conta</span>
        <span>01 a 31/03</span>
      </div>
      <div className="process-anim__rows">
        {TRANSACTIONS.map((tx, index) => (
          <div
            key={tx.memo}
            className="process-anim__row"
            data-kind={tx.kind}
            style={cssVars({ "--i": index })}
          >
            <span>{tx.date}</span>
            <span>{tx.memo}</span>
            <strong>{tx.amount}</strong>
          </div>
        ))}
      </div>
      <div className="process-anim__scan" />
    </article>
  );
}

function PhotoSource() {
  const tilts = ["-1.4deg", "1.1deg", "-0.6deg", "1.6deg", "-1.8deg"];
  return (
    <article className="process-anim__polaroid" aria-label="Foto de caderno manuscrito">
      <div className="process-anim__notebook">
        <div className="process-anim__hand">
          {TRANSACTIONS.map((tx, index) => (
            <p
              key={tx.hand}
              style={cssVars({ "--i": index, "--tilt": tilts[index] })}
            >
              {tx.date} {tx.hand} <em>{tx.amount}</em>
            </p>
          ))}
        </div>
      </div>
      <span className="process-anim__photo-label">IMG_2403.jpg · caderno</span>
    </article>
  );
}

function OfxDest() {
  return (
    <article className="process-anim__ofx" aria-label="Arquivo OFX conferido">
      <div className="process-anim__ofx-top">
        <span>extrato.ofx</span>
        <span>OFX</span>
      </div>
      <div className="process-anim__code">
        {TRANSACTIONS.map((tx, index) => (
          <span key={tx.memo} style={cssVars({ "--i": index })}>
            &lt;STMTTRN&gt; <b>{tx.amount}</b> {tx.memo}
          </span>
        ))}
      </div>
      <p className="process-anim__math">
        4.120,00 + lancamentos = 6.535,70
      </p>
    </article>
  );
}
