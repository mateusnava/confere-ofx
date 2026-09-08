import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quem somos | Confere OFX",
  description:
    "O Confere OFX converte PDF e foto de extrato em OFX, Excel ou CSV. Só libera se a conta fechar.",
};

export default function QuemSomosPage() {
  return (
    <main className="flex-1 bg-[#f4fbf9] px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Sobre
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Quem somos
        </h1>
        <p className="mt-3 text-[#3d5c56]">
          Um conversor de extrato que só entrega o arquivo se a soma fechar.
        </p>

        <div className="mt-10 space-y-8 text-[#1c2a26]">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              O que a gente faz
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              O Confere OFX lê o extrato que você já tem — PDF do banco ou
              foto do caderno — e devolve OFX, Excel ou CSV. O contador
              precisa do arquivo que o sistema importa. O aplicativo do banco
              te dá um PDF para ler. A gente faz a ponte.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Por que existe a conferência
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Converter sem somar é chute. Aqui a regra é conta: abertura +
              lançamentos tem que dar o fechamento. Se fecha, o arquivo sai.
              Se um centavo não fecha, a gente avisa e você confirma. Não é
              palpite de layout. É aritmética.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              De onde isso saiu
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              O produto é feito no Brasil, para extrato brasileiro: PIX, TED,
              boleto, caderno de mercearia e o PDF torto do aplicativo. A
              conta e o suporte passam pelo e-mail{" "}
              <a
                href="mailto:nava.mateus@gmail.com"
                className="font-medium text-[#0F6B5C] hover:underline"
              >
                nava.mateus@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link
            href="/pdf-para-ofx"
            className="rounded-full bg-[#0F6B5C] px-5 py-2 font-semibold text-white hover:bg-teal-800"
          >
            Converter extrato
          </Link>
          <Link
            href="/privacidade"
            className="rounded-full border border-[#0F6B5C]/20 px-5 py-2 font-semibold text-[#0F6B5C]"
          >
            Política de privacidade
          </Link>
          <Link
            href="/termos"
            className="rounded-full border border-[#0F6B5C]/20 px-5 py-2 font-semibold text-[#0F6B5C]"
          >
            Termos de uso
          </Link>
        </div>
      </article>
    </main>
  );
}
