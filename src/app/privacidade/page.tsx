import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidade | Confere OFX",
  description:
    "Como o Confere OFX trata e-mail, extratos e pagamentos. Leitura, retenção e direitos pela LGPD.",
};

export default function PrivacidadePage() {
  return (
    <main className="flex-1 bg-[#f4fbf9] px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0F6B5C]">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Política de privacidade
        </h1>
        <p className="mt-3 text-[#3d5c56]">
          Última atualização: 8 de setembro de 2026.
        </p>

        <div className="mt-10 space-y-8 text-[#1c2a26]">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Quem trata os dados
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              O Confere OFX é o responsável pelo tratamento. Para exercer seus
              direitos ou tirar dúvida, escreva para{" "}
              <a
                href="mailto:nava.mateus@gmail.com"
                className="font-medium text-[#0F6B5C] hover:underline"
              >
                nava.mateus@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              O que a gente coleta
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-[#3d5c56]">
              <li>
                E-mail, para criar a conta, enviar o código de acesso e
                identificar créditos.
              </li>
              <li>
                Extrato em PDF ou foto do caderno, só pelo tempo necessário para
                ler, conferir o saldo e gerar OFX, Excel ou CSV.
              </li>
              <li>
                Resultado da conversão: lançamentos, saldos e o arquivo que você
                baixa, enquanto a sessão estiver válida.
              </li>
              <li>
                Dados de pagamento tratados pelo Mercado Pago quando você
                compra créditos. Não guardamos número de cartão.
              </li>
              <li>
                Endereço IP e registros técnicos de uso, para segurança, cota
                e funcionamento do serviço.
              </li>
              <li>
                Nome e mensagem, se você nos escreve pelo formulário de
                contato.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Para que usamos
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Os dados servem para autenticar você, converter o extrato,
              conferir se abertura + lançamentos fecha com o fechamento,
              cobrar créditos, enviar e-mail operacional e responder contato.
              Não vendemos extrato nem lista de e-mail.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Quem nos ajuda a processar
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Para ler o PDF ou a foto, o arquivo passa por um modelo de
              inteligência artificial da Google. Hospedagem, arquivos
              temporários e banco ficam em infraestrutura da Vercel e do
              Neon. O código de acesso sai pelo Resend. O Pix e os
              pagamentos passam pelo Mercado Pago. Cada um trata o mínimo
              necessário para a tarefa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Por quanto tempo fica
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              A conta e o saldo de créditos ficam enquanto você usa o
              serviço. A sessão de conversão e o extrato associado expiram e
              são apagados depois desse prazo. Mensagens de contato
              permanecem no e-mail pelo tempo da conversa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">
              Seus direitos
            </h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Pela LGPD, você pode pedir confirmação de tratamento, acesso,
              correção, anonimização, portabilidade ou exclusão dos dados, e
              também se opor a um uso que não seja necessário para o
              contrato. É só escrever no e-mail acima. Se achar que houve
              irregularidade, você pode falar com a Autoridade Nacional de
              Proteção de Dados (ANPD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Cookies</h2>
            <p className="leading-relaxed text-[#3d5c56]">
              Usamos cookies e armazenamento local só para manter a sessão
              autenticada e o funcionamento do site. Não usamos rede de
              anúncio de terceiros nesta política.
            </p>
          </section>
        </div>

        <p className="mt-10 text-sm text-[#3d5c56]">
          O uso do site também segue os{" "}
          <Link href="/termos" className="font-medium text-[#0F6B5C] hover:underline">
            termos de uso
          </Link>
          . Quer saber de onde isso veio? Leia{" "}
          <Link href="/quem-somos" className="font-medium text-[#0F6B5C] hover:underline">
            quem somos
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
