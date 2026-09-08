import Link from "next/link";
import { Footer } from "@/components/Footer";
import "./artigos.css";

export default function ArtigosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="artigos-top">
        <div className="artigos-top-inner">
          <Link href="/">Confere OFX</Link>
          <nav>
            <Link href="/artigos">Artigos</Link>
            <Link href="/pdf-para-ofx">Converter</Link>
          </nav>
        </div>
      </header>
      {children}
      <Footer variant="artigos" />
    </>
  );
}
