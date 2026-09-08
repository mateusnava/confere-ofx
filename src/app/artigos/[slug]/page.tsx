import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ARTICLES,
  getArticle,
  type ArticleBlock,
} from "@/lib/articles";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/artigos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    return { title: "Artigo | Confere OFX" };
  }
  return {
    title: `${article.title} | Confere OFX`,
    description: article.description,
  };
}

export default async function ArtigoPage({
  params,
}: PageProps<"/artigos/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }

  const others = ARTICLES.filter((item) => item.slug !== article.slug).sort(
    (a, b) => b.date.localeCompare(a.date),
  );

  return (
    <main className="artigos">
      <article className="artigos-shell">
        <p className="kicker">
          <Link href="/artigos">Artigos</Link>
        </p>
        <h1>{article.title}</h1>
        <p className="artigo-meta">
          <time dateTime={article.date}>
            {new Date(`${article.date}T12:00:00`).toLocaleDateString("pt-BR")}
          </time>
        </p>
        <div className="artigo-body">
          {article.blocks.map((block, index) => (
            <ArticleBlockView key={`${block.type}-${index}`} block={block} />
          ))}
        </div>
        <p className="artigo-cta">
          <Link href="/pdf-para-ofx">Converter PDF em OFX</Link>
        </p>
        {others.length > 0 ? (
          <ol className="artigo-more">
            {others.map((item) => (
              <li key={item.slug}>
                <Link href={`/artigos/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ol>
        ) : null}
      </article>
    </main>
  );
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "p") {
    return <p>{block.text}</p>;
  }
  if (block.type === "h2") {
    return <h2>{block.text}</h2>;
  }
  if (block.type === "ul") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <ol>
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
