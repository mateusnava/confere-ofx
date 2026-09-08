export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  blocks: ArticleBlock[];
};

export const ARTICLES: Article[] = [
  {
    slug: "o-que-e-ofx",
    title: "O que é OFX e por que o contador pede esse arquivo",
    description:
      "OFX é o formato de extrato que o sistema do contador importa. Entenda a diferença para PDF, Excel e CSV.",
    date: "2026-03-14",
    blocks: [
      {
        type: "p",
        text: "OFX significa Open Financial Exchange. Na prática, é um arquivo de texto com data, valor e descrição de cada lançamento da conta. O sistema de contabilidade lê esse arquivo e monta o livro-caixa sem alguém copiar linha por linha.",
      },
      {
        type: "p",
        text: "O PDF do banco não faz isso. Ele serve para você ler. O OFX serve para o programa importar.",
      },
      {
        type: "h2",
        text: "O que vai dentro de um OFX",
      },
      {
        type: "ul",
        items: [
          "Data de cada lançamento",
          "Valor, com sinal de entrada ou saída",
          "Descrição: PIX, TED, débito, tarifa",
          "Saldo de abertura e, quando o banco informa, o de fechamento",
        ],
      },
      {
        type: "h2",
        text: "OFX, Excel e CSV",
      },
      {
        type: "p",
        text: "Excel e CSV também carregam a lista de lançamentos. Muitos escritórios pedem OFX porque o programa de contabilidade já nasceu falando essa língua. CSV e planilha servem quando o fluxo é outro: conferência manual, relatório interno, outro sistema.",
      },
      {
        type: "p",
        text: "No Confere OFX você baixa os três depois da conferência de saldo. O arquivo só sai se abertura + lançamentos fechar com o fechamento, ou se você confirmar a diferença.",
      },
      {
        type: "h2",
        text: "PDF não é OFX",
      },
      {
        type: "p",
        text: "O aplicativo do banco gera um PDF bonito. O contador precisa do OFX. São coisas diferentes. Converter PDF em OFX é o caminho entre o extrato que você tem e o arquivo que o sistema aceita.",
      },
    ],
  },
  {
    slug: "converter-pdf-em-ofx",
    title: "Como converter PDF em OFX",
    description:
      "Passo a passo para transformar extrato em PDF para OFX. Também vale foto do caderno. A gente confere o saldo.",
    date: "2026-06-02",
    blocks: [
      {
        type: "p",
        text: "A busca mais comum no Brasil é direta: converter PDF em OFX, PDF para OFX, transformar PDF em OFX. O pedido é o mesmo. Você tem o extrato em PDF e precisa do arquivo que o contador importa.",
      },
      {
        type: "h2",
        text: "O caminho no Confere OFX",
      },
      {
        type: "ol",
        items: [
          "Entre e solte o PDF do banco. Nubank, Inter, Itaú, Bradesco, Banco do Brasil e os outros de sempre.",
          "A gente lê cada lançamento e soma com o saldo de abertura.",
          "Se o total fecha com o fechamento, o OFX fica pronto. Se não fecha, você vê a diferença e confirma.",
          "Baixe OFX, Excel ou CSV.",
        ],
      },
      {
        type: "h2",
        text: "E se o extrato for foto?",
      },
      {
        type: "p",
        text: "Também vale. Foto do aplicativo, scan ou página de caderno, mesmo torta. A leitura é a mesma: cada linha vira lançamento, a soma precisa fechar.",
      },
      {
        type: "h2",
        text: "O que não precisa fazer",
      },
      {
        type: "ul",
        items: [
          "Não precisa passar para planilha na mão",
          "Não precisa conferir centavo por centavo no escuro",
          "Não precisa de programa instalado no computador",
        ],
      },
      {
        type: "p",
        text: "A primeira conversão na conta é grátis. Depois, você compra só o que for usar.",
      },
    ],
  },
  {
    slug: "como-funciona-a-conversao",
    title: "Como funciona a conversão de extrato bancário",
    description:
      "A conversão lê cada lançamento, soma com a abertura e só libera o OFX se o saldo fechar com o fechamento.",
    date: "2026-07-21",
    blocks: [
      {
        type: "p",
        text: "Converter extrato não é só trocar a extensão do arquivo. O PDF (ou a foto) precisa virar uma lista de lançamentos com data, valor e descrição. Essa lista precisa fechar a conta.",
      },
      {
        type: "h2",
        text: "A conta que a gente faz",
      },
      {
        type: "p",
        text: "Abertura + lançamentos = fechamento. Se o banco diz que a conta abriu em R$ 4.120,00 e fechou em R$ 6.535,70, a soma dos PIX, aluguéis, compras e tarifas tem que dar essa diferença. Um centavo a mais ou a menos, a gente avisa.",
      },
      {
        type: "h2",
        text: "O que acontece em cada etapa",
      },
      {
        type: "ol",
        items: [
          "Leitura: o extrato vira linhas. PIX recebido, aluguel, mercado, luz.",
          "Soma: cada valor entra na conta com o sinal certo.",
          "Conferência: o total é comparado com o fechamento que o banco informou.",
          "Saída: se fecha, você baixa. Se não fecha, confirma antes.",
        ],
      },
      {
        type: "h2",
        text: "Por que a conferência importa",
      },
      {
        type: "p",
        text: "Um OFX com linha faltando ou valor invertido entra no sistema do contador como se estivesse certo. A conferência de saldo pega isso antes do download. Não é palpite. É aritmética no servidor.",
      },
      {
        type: "p",
        text: "Quer ver o processo? Abra a página inicial e troque entre PDF e foto. Ou vá direto para converter.",
      },
    ],
  },
  {
    slug: "pdf-para-ofx",
    title: "PDF para OFX: o que muda no extrato",
    description:
      "O PDF do banco é para ler. O OFX é para importar. Veja o que o arquivo precisa ter para o sistema do contador.",
    date: "2026-05-09",
    blocks: [
      {
        type: "p",
        text: "PDF para OFX é o nome que o escritório dá ao trabalho: pegar o extrato do aplicativo e devolver um arquivo que o programa de contabilidade aceita. Sem isso, alguém digita.",
      },
      {
        type: "h2",
        text: "O que o PDF traz",
      },
      {
        type: "p",
        text: "Nome do banco, período, tabela de lançamentos, às vezes o saldo no rodapé. Bom para conferir no olho. Ruim para importar. Cada banco desenha o PDF de um jeito. O sistema do contador não lê layout de Nubank, Inter ou Itaú.",
      },
      {
        type: "h2",
        text: "O que o OFX precisa ter",
      },
      {
        type: "ul",
        items: [
          "Um lançamento por movimento, com data e valor",
          "Descrição reconhecível: PIX, TED, débito",
          "Sinal correto: crédito soma, débito subtrai",
          "Saldo que fecha, quando o banco informa abertura e fechamento",
        ],
      },
      {
        type: "h2",
        text: "Do PDF ao arquivo",
      },
      {
        type: "p",
        text: "No Confere OFX você solta o PDF (ou a foto). A gente monta os lançamentos, confere a conta e libera OFX, Excel ou CSV. Se a soma não fechar, você vê antes de baixar.",
      },
      {
        type: "p",
        text: "Esse é o trabalho inteiro: PDF para OFX, com o saldo conferido.",
      },
    ],
  },
  {
    slug: "imagem-para-ofx",
    title: "Imagem para OFX: foto do extrato vira arquivo",
    description:
      "Converter imagem em OFX: foto do aplicativo, scan ou caderno manuscrito. A gente lê, soma e confere o saldo.",
    date: "2026-08-27",
    blocks: [
      {
        type: "p",
        text: "Nem sempre o extrato chega em PDF. Às vezes é um print do aplicativo, um scan torto ou uma página de caderno. Imagem para OFX é esse caminho: a foto vira lançamento, o lançamento vira arquivo para o contador.",
      },
      {
        type: "h2",
        text: "Que imagem serve",
      },
      {
        type: "ul",
        items: [
          "Foto da tela do banco: Nubank, Inter, Itaú, Bradesco, Banco do Brasil",
          "Scan ou foto do extrato impresso",
          "Caderno com PIX, aluguel, mercado, mesmo com letra de mão",
        ],
      },
      {
        type: "p",
        text: "Não precisa estar alinhado. Foto um pouco torta ainda vale. O que importa é dar para ler data, descrição e valor.",
      },
      {
        type: "h2",
        text: "Como a foto vira OFX",
      },
      {
        type: "ol",
        items: [
          "Você manda a imagem.",
          "A gente lê cada linha e monta os lançamentos.",
          "Soma abertura + movimentação e compara com o fechamento, quando o extrato informa.",
          "Se fecha, baixa OFX, Excel ou CSV. Se não fecha, você confirma.",
        ],
      },
      {
        type: "h2",
        text: "Foto e PDF são o mesmo trabalho",
      },
      {
        type: "p",
        text: "O sistema do contador não importa JPEG. Ele importa OFX. A imagem é só o jeito de entregar o extrato. A conferência de saldo é a mesma do PDF: um centavo a mais ou a menos, a gente avisa.",
      },
      {
        type: "p",
        text: "Na página inicial, troque para Foto e veja o caderno virar extrato.ofx. Ou vá direto em converter e solte a imagem.",
      },
    ],
  },
];

export function listArticles() {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}

export function articlePath(slug: string) {
  return `/artigos/${slug}`;
}
