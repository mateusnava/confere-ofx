import type { Metadata } from "next";
import Link from "next/link";
import { PLAN_PRICES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Confere OFX | PDF vira OFX",
  description:
    "Converta extrato bancario brasileiro em OFX, Excel ou CSV. A gente confere o saldo.",
};

export default function HomePage() {
  return (
    <main className="flex-1 bg-[#f4fbf9] text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F6B5C]">
          Extrato brasileiro, conferido
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          PDF ou foto vira OFX. A gente confere o saldo.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-[#3d5c56]">
          Envie o extrato — PDF, foto ou scan. A gente le, soma cada centavo e
          avisa se abertura + lancamentos nao fecha com o fechamento. Sem
          planilha no escuro.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/pdf-para-ofx"
            className="rounded-full bg-[#0F6B5C] px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Converter agora
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[#0F6B5C]/20 px-6 py-3 text-sm font-semibold text-[#0F6B5C]"
          >
            Entrar ou criar conta
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-16 sm:grid-cols-3">
        {[
          ["1. Solta o PDF ou a foto", "Nubank, Inter, Itau, Bradesco, BB e os outros de sempre."],
          ["2. Conferimos o saldo", "Aritmetica no servidor. Se nao fechar, voce confirma antes de baixar."],
          ["3. Baixa OFX, Excel ou CSV", "Pronto para o sistema do contador."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#0F6B5C]">{title}</h2>
            <p className="mt-2 text-sm text-[#3d5c56]">{copy}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">Planos</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-[#0F6B5C]">Gratis</h3>
            <p className="mt-2 text-sm text-[#3d5c56]">1 consulta por IP/dia</p>
          </div>
          {(["pro", "escritorio"] as const).map((plan) => (
            <div key={plan} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-[#0F6B5C]">
                {PLAN_PRICES[plan].label}
              </h3>
              <p className="mt-2 text-sm text-[#3d5c56]">
                {PLAN_PRICES[plan].price} ·{" "}
                {PLAN_PRICES[plan].pages.toLocaleString("pt-BR")} paginas/mes
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
