import Link from "next/link";
import { auth } from "@/auth";
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
      <svg className="lab-grain" aria-hidden>
        <filter id="lab-grain-filter" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.55"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#lab-grain-filter)" />
      </svg>
      <div className="lab-shell">
        <header>
          <Link href="/">Confere OFX</Link>
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
              Tambem vale foto do caderno. A gente le, soma e so libera se
              abertura + lancamentos fechar com o fechamento.
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
                  Comprar creditos
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="paper-well">
          <p className="demo-kicker">Como funciona</p>
          <ol className="demo-steps">
            <li>
              <strong>1. Voce manda</strong>
              PDF do app ou foto do caderno, mesmo torta.
            </li>
            <li>
              <strong>2. A gente confere</strong>
              Le cada linha e soma: abertura + lancamentos.
            </li>
            <li>
              <strong>3. Voce baixa</strong>
              Se fecha, sai OFX. Se nao fecha, voce confirma.
            </li>
          </ol>
          <div className="demo-sides" aria-hidden>
            <span>O que voce envia</span>
            <span>O que voce recebe</span>
          </div>
          <ProcessAnimation
            defaultMode="photo"
            showStamp={false}
            theme={{
              paper: "oklch(96.5% 0.012 95)",
              ink: "oklch(27% 0.028 165)",
              accent: "oklch(42% 0.074 172)",
            }}
          />
        </div>

        <section className="proof">
          <div>
            <h2>O que a gente confere</h2>
            <p className="lead">
              Nao e palpite. E conta: abertura + lancamentos tem que dar o
              fechamento. Um centavo a mais ou a menos, a gente avisa.
            </p>
            <ol className="explain">
              <li>
                <strong>Leitura</strong>
                PIX, aluguel, mercado, luz. Do PDF ou da letra de mao.
              </li>
              <li>
                <strong>Soma</strong>
                4.120,00 de abertura + os lancamentos = 6.535,70.
              </li>
              <li>
                <strong>Saida</strong>
                Se fecha, baixa OFX, Excel ou CSV. Se nao fecha, voce confirma.
              </li>
            </ol>
          </div>
          <ul className="prices">
            <li>
              <span>Gratis</span>
              <span>1 conversao</span>
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
              <Link href="/comprar">Comprar creditos</Link>
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
