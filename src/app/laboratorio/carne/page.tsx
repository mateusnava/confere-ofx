import Link from "next/link";
import { ProcessAnimation } from "@/components/ProcessAnimation";
import { CREDIT_PACKS } from "@/lib/credits";

export default function CarneLandingPage() {
  return (
    <main className="lab lab-carne">
      <div className="boleto">
        <div className="picote" aria-hidden />
        <header>
          <span>Ficha de compensacao</span>
          <Link href="/pdf-para-ofx">Converter</Link>
        </header>

        <section className="hero">
          <h1>Extrato no formulario. OFX na linha.</h1>
          <p className="lead">
            O papel que voce ja conhece, sem o banco no meio. PDF ou foto vira
            arquivo conferido para o contador.
          </p>
          <div className="campos">
            <div className="campo">
              Beneficiario
              <b>Confere OFX</b>
            </div>
            <div className="campo">
              Pagador
              <b>Seu extrato, PDF ou foto</b>
            </div>
            <div className="campo">
              Valor
              <b>1 conversao gratis na conta</b>
            </div>
          </div>
          <div className="actions">
            <Link href="/pdf-para-ofx" className="lab-cta">
              Converter agora
            </Link>
            <Link href="/login" className="lab-cta lab-cta-ghost">
              Entrar
            </Link>
          </div>
        </section>

        <div className="faixa">
          <span>Nubank</span>
          <span>Inter</span>
          <span>Itau</span>
          <span>Bradesco</span>
          <span>BB</span>
        </div>

        <div className="px-4 py-4">
          <ProcessAnimation
            defaultMode="pdf"
            theme={{
              paper: "#e8eef6",
              ink: "#1a3358",
              accent: "#2f5d9a",
              stamp: "#c45c12",
            }}
          />
        </div>

        <div className="linha">
          <strong>01</strong>
          <p>Corta o PDF ou a foto e cola aqui.</p>
        </div>
        <div className="linha">
          <strong>02</strong>
          <p>Aritmetica no servidor. Se o saldo nao fechar, voce confirma.</p>
        </div>
        <div className="linha">
          <strong>03</strong>
          <p>
            OFX, Excel ou CSV. {CREDIT_PACKS.pack_1.price} /{" "}
            {CREDIT_PACKS.pack_10.price} / {CREDIT_PACKS.pack_50.price}{" "}
            <Link href="/comprar">Comprar creditos</Link>
          </p>
        </div>
        <div className="barcode" aria-hidden />
      </div>
    </main>
  );
}
