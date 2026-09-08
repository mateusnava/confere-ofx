import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de uso | Confere OFX",
  description:
    "Regras de uso do Confere OFX: conta, créditos, conversão de extrato e responsabilidade.",
};

export default function TermosPage() {
  return (
    <main className="flex-1 bg-[#f4fbf9] px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Termos de uso
        </h1>
        <p className="mt-3 text-[#3d5c56]">
          Última atualização: 8 de setembro de 2026.
        </p>

        <div className="mt-10 space-y-8 text-[#1c2a26]">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              O serviço
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              O Confere OFX converte extrato em PDF ou foto de caderno em
              OFX, Excel ou CSV. A ferramenta lê os lançamentos, soma
              abertura + movimentos e só libera o arquivo se o fechamento
              bater — ou se você confirmar a diferença. Não é software de
              contabilidade nem parecer profissional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Conta</h2>
            <p className="leading-relaxed text-[#3d5c56]">
              O acesso é por e-mail e código temporário. O primeiro acesso
              cria a conta. Você responde pela veracidade do e-mail e pelo
              que envia. Se quiser encerrar, peça pelo contato do site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Créditos e pagamento
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              A primeira conversão da conta é grátis. As seguintes gastam um
              crédito cada. Os pacotes atuais são 1 crédito por R$ 4,90, 10
              por R$ 39,90 e 50 por R$ 149. Créditos não vencem. O Pix e a
              cobrança passam pelo Mercado Pago. Preço pode mudar; o valor
              vigente é o da tela de compra no momento do pagamento.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              O que você pode enviar
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Envie só extrato que você tem direito de tratar: conta
              própria, do cliente com autorização ou do negócio que você
              administra. Não use o serviço para spam, tentativa de
              sobrecarga, engenharia reversa abusiva ou conteúdo ilícito.
              Podemos recusar conversão ou encerrar a conta se o uso
              comprometer o serviço ou terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Leitura e conferência
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              A leitura usa inteligência artificial e regras de soma. PDF
              rasurado, foto torta, senha errada ou layout novo do banco
              podem falhar. A conferência reduz erro, não elimina. Você
              revisa o resultado antes de importar no sistema do contador.
              Se a conta não fecha, a responsabilidade de confirmar ou
              corrigir é sua.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Disponibilidade
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              O site pode ficar fora do ar para manutenção, falha de
              provedor ou limite técnico. Sessões de conversão expiram. Não
              prometemos prazo de arquivo eterno nem disponibilidade
              ininterrupta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Responsabilidade
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Na medida permitida pela lei brasileira, o Confere OFX não
              responde por dano indireto, lucro cessante ou lançamento
              importado sem revisão. Se houver dever de indenizar, o teto é
              o valor que você pagou nos 12 meses anteriores ao fato, salvo
              dolo ou outra regra irrenunciável.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Lei e foro
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Estes termos seguem a lei brasileira. Privacidade está na{" "}
              <Link
                href="/privacidade"
                className="font-medium text-[#0F6B5C] hover:underline"
              >
                política de privacidade
              </Link>
              . Controvérsia se resolve no foro do domicílio do usuário
              consumidor.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-[#3d5c56]">
          Dúvida sobre o produto? Veja{" "}
          <Link
            href="/quem-somos"
            className="font-medium text-[#0F6B5C] hover:underline"
          >
            quem somos
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
