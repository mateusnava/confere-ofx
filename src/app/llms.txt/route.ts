import { listArticles } from "@/lib/articles";
import { appBaseUrl } from "@/lib/app-url";

export function GET() {
  const base = appBaseUrl();
  const articles = listArticles()
    .map(
      (article) =>
        `- [${article.title}](${base}/artigos/${article.slug}): ${article.description}`,
    )
    .join("\n");

  const body = `# Confere OFX

> Converte extrato bancário brasileiro (PDF ou foto) em OFX, Excel ou CSV. O arquivo só sai se o saldo fechar.

Confere OFX lê cada lançamento do extrato, soma com o saldo de abertura e compara com o fechamento. Se a conta fecha, libera OFX, Excel ou CSV. Se não fecha, o usuário vê a diferença e confirma.

A primeira conversão na conta é grátis. Depois, créditos via Pix.

## Páginas

- [Início](${base}/): converter PDF ou foto de extrato em OFX
- [Artigos](${base}/artigos): o que é OFX e como converter
- [Converter](${base}/pdf-para-ofx): ferramenta de conversão (pede conta)

## Artigos

${articles}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
