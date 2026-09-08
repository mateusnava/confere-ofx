import Link from "next/link";
import { ProcessAnimation } from "@/components/ProcessAnimation";
import { CREDIT_PACKS } from "@/lib/credits";

export default function MesaLandingPage() {
  return (
    <main className="lab lab-mesa">
      <div className="lab-shell">
        <header>
          <span>Confere OFX</span>
          <Link href="/pdf-para-ofx">Converter</Link>
        </header>

        <section className="hero-grid">
          <div>
            <h1>Ate letra de mao vira OFX.</h1>
            <p className="hand-note">manda a foto do caderno</p>
            <p className="lead">
              Extrato impresso, print do app ou rascunho. A gente le e so deixa
              baixar se o saldo fechar.
            </p>
            <div className="actions">
              <Link href="/pdf-para-ofx" className="lab-cta">
                Mandar a foto
              </Link>
              <Link href="/login" className="lab-cta lab-cta-ghost">
                Entrar
              </Link>
            </div>
          </div>
          <ProcessAnimation
            defaultMode="photo"
            theme={{
              paper: "#e4c89a",
              ink: "#3a2618",
              accent: "#5c3d24",
              stamp: "#9b2d1f",
            }}
          />
        </section>

        <section className="receipts" aria-label="Como funciona">
          <div className="receipt">
            <strong>01</strong>
            <p>Solta o PDF ou a foto. Nubank, Inter, Itau, Bradesco, BB, caderno.</p>
          </div>
          <div className="receipt">
            <strong>02</strong>
            <p>Conferimos a conta no servidor. Se nao fechar, voce confirma.</p>
          </div>
          <div className="receipt">
            <strong>03</strong>
            <p>Baixa OFX, Excel ou CSV para o sistema do contador.</p>
          </div>
        </section>

        <section className="packs">
          <p>
            1 conversao gratis. Depois {CREDIT_PACKS.pack_1.price},{" "}
            {CREDIT_PACKS.pack_10.price} ou {CREDIT_PACKS.pack_50.price}.
          </p>
          <Link href="/comprar">Comprar creditos</Link>
        </section>
      </div>
    </main>
  );
}
