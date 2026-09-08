import Link from "next/link";
import { ProcessAnimation } from "@/components/ProcessAnimation";
import { CREDIT_PACKS } from "@/lib/credits";

export default function ScannerLandingPage() {
  return (
    <main className="lab lab-scanner">
      <div className="scan-beam" aria-hidden />
      <header>
        <span>Confere OFX · copia 01</span>
        <Link href="/pdf-para-ofx">Converter</Link>
      </header>

      <section className="hero">
        <p className="kicker">Vidraca · PDF ou foto</p>
        <h1 className="xerox">Passa na vidraca. Sai OFX.</h1>
        <p className="lead">
          PDF do banco ou <em>foto do caderno</em>, mesmo torta. A maquina le,
          soma cada centavo e so libera se abertura + lancamentos fecha com o
          fechamento.
        </p>
        <div className="actions">
          <Link href="/pdf-para-ofx" className="lab-cta">
            Passar na maquina
          </Link>
          <Link href="/login" className="lab-cta lab-cta-ghost">
            Entrar
          </Link>
        </div>

        <div className="platen">
          <div className="platen-label">
            <span>Vidro do scanner</span>
            <span>Foto ligada</span>
          </div>
          <ProcessAnimation
            defaultMode="photo"
            theme={{
              paper: "#d8dcb0",
              ink: "#16150f",
              accent: "#4d5618",
              stamp: "#c45c12",
            }}
          />
        </div>
      </section>

      <p className="banks">
        <span>Nubank</span>
        <span>Inter</span>
        <span>Itau</span>
        <span>Bradesco</span>
        <span>Banco do Brasil</span>
        <span>e o caderno</span>
      </p>

      <section className="copies" aria-label="Como funciona">
        <article className="copy">
          <span>Copia 1</span>
          <h2>Solta o original</h2>
          <p>PDF, foto do app ou pagina de caderno. Nao precisa estar bonito.</p>
        </article>
        <article className="copy">
          <span>Copia 2</span>
          <h2>A leitura confere</h2>
          <p>
            Cada linha vira lancamento. Se a conta nao fechar, voce confirma
            antes de baixar.
          </p>
        </article>
        <article className="copy">
          <span>Copia 3</span>
          <h2>Sai OFX limpo</h2>
          <p>OFX, Excel ou CSV. Pronto para o sistema do contador.</p>
        </article>
      </section>

      <section className="price-strip">
        <p>1 conversao gratis na conta. Depois, so o que for usar.</p>
        <p>
          {CREDIT_PACKS.pack_1.price} · {CREDIT_PACKS.pack_10.price} ·{" "}
          {CREDIT_PACKS.pack_50.price}
        </p>
        <Link href="/comprar">Comprar creditos</Link>
      </section>

      <section className="final">
        <h2>Poe na vidraca.</h2>
        <div className="actions">
          <Link href="/pdf-para-ofx" className="lab-cta">
            Converter agora
          </Link>
        </div>
      </section>
    </main>
  );
}
