import type { Metadata } from "next";
import Link from "next/link";
import { listArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Artigos | Converter PDF em OFX",
  description:
    "O que é OFX, como converter PDF em OFX e como a conversão de extrato confere o saldo.",
};

export default function ArtigosPage() {
  return (
    <main className="artigos">
      <div className="artigos-shell artigos-index">
        <p className="kicker">Artigos</p>
        <h1>PDF, OFX e a conta que fecha</h1>
        <p className="deck">
          Textos curtos sobre o formato que o contador pede e o caminho do
          extrato até o arquivo.
        </p>
        <ol className="artigos-list">
          {listArticles().map((article) => (
            <li key={article.slug}>
              <Link href={`/artigos/${article.slug}`}>
                <time dateTime={article.date}>
                  {new Date(`${article.date}T12:00:00`).toLocaleDateString(
                    "pt-BR",
                  )}
                </time>
                <span>
                  <span className="artigos-list-title">{article.title}</span>
                  <p>{article.description}</p>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
