import Link from "next/link";
import { auth } from "@/auth";
import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { ProcessAnimation } from "@/components/ProcessAnimation";
import { listArticles } from "@/lib/articles";
import { CREDIT_PACKS, formatCredits } from "@/lib/credits";
import { getUserByEmail } from "@/lib/quota";
import "@/app/laboratorio/lab-landings.css";

type CarimboLandingProps = {
  labPad?: boolean;
};

export async function CarimboLanding({ labPad = false }: CarimboLandingProps) {
  const session = await auth();
  const email = session?.user?.email;
  const user = email ? await getUserByEmail(email) : undefined;

  return (
    <main className={`lab lab-carimbo${labPad ? "" : " lab-carimbo--site"}`}>
      <div className="lab-shell">
        <header>
          <Link href="/" className="lab-brand">
            <BrandMark className="lab-brand-mark" />
            Confere OFX
          </Link>
          <nav className="landing-nav">
            <Link href="/artigos">Artigos</Link>
            <Link href="/pdf-para-ofx">Converter</Link>
            {email ? (
              <>
                <span>{formatCredits(user?.credits ?? 0)}</span>
                <Link href="/perfil">Perfil</Link>
              </>
            ) : (
              <Link href="/login">Entrar</Link>
            )}
          </nav>
        </header>

        <section className="hero">
          <div>
            <h1>Converter PDF em OFX</h1>
            <p className="lead">
              Também vale foto do caderno. A gente lê, soma e só libera se
              abertura + lançamentos fechar com o fechamento.
            </p>
            <div className="actions">
              <Link href="/pdf-para-ofx" className="lab-cta">
                Converter agora
              </Link>
              {!email ? (
                <Link href="/login" className="lab-cta lab-cta-ghost">
                  Entrar
                </Link>
              ) : (
                <Link href="/comprar" className="lab-cta lab-cta-ghost">
                  Comprar créditos
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="demo">
          <ol className="demo-steps">
            <li>
              <strong>Você manda</strong>
              PDF do app ou foto do caderno, mesmo torta.
            </li>
            <li>
              <strong>A gente confere</strong>
              Lê cada linha e soma: abertura + lançamentos.
            </li>
            <li>
              <strong>Você baixa</strong>
              Se fecha, sai OFX. Se não fecha, você confirma.
            </li>
          </ol>
          <ProcessAnimation
            defaultMode="photo"
            showStamp={false}
            theme={{
              paper: "#eef6f3",
              ink: "#1c2a26",
              accent: "#0F6B5C",
            }}
          />
        </section>

        <section className="proof">
          <div>
            <h2>O que a gente confere</h2>
            <p className="lead">
              Não é palpite. É conta: abertura + lançamentos tem que dar o
              fechamento. Um centavo a mais ou a menos, a gente avisa.
            </p>
            <ol className="explain">
              <li>
                <strong>Leitura</strong>
                PIX, aluguel, mercado, luz. Do PDF ou da letra de mão.
              </li>
              <li>
                <strong>Soma</strong>
                4.120,00 de abertura + os lançamentos = 6.535,70.
              </li>
              <li>
                <strong>Saída</strong>
                Se fecha, baixa OFX, Excel ou CSV. Se não fecha, você confirma.
              </li>
            </ol>
          </div>
          <ul className="prices">
            <li>
              <span>Grátis</span>
              <span>1 conversão</span>
            </li>
            <li>
              <span>{CREDIT_PACKS.pack_1.label}</span>
              <span>{CREDIT_PACKS.pack_1.price}</span>
            </li>
            <li>
              <span>{CREDIT_PACKS.pack_10.label}</span>
              <span>{CREDIT_PACKS.pack_10.price}</span>
            </li>
            <li>
              <span>{CREDIT_PACKS.pack_50.label}</span>
              <span>{CREDIT_PACKS.pack_50.price}</span>
            </li>
            <li>
              <Link href="/comprar">Comprar créditos</Link>
            </li>
          </ul>
        </section>

        <section className="artigos-home">
          <h2>Artigos</h2>
          <ol>
            {listArticles().map((article) => (
              <li key={article.slug}>
                <Link href={`/artigos/${article.slug}`}>
                  <strong>{article.title}</strong>
                  <span>{article.description}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
        {labPad ? null : <Footer variant="landing" />}
      </div>
    </main>
  );
}
