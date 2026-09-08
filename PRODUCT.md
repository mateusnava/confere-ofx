# Confere OFX

## Design Context

### Users

Contadores, MEIs e donos de negocio pequeno no Brasil. Usam o produto no meio do expediente: extrato do banco na mao (PDF do app, foto torta, scan, as vezes caderno), prazo do sistema do contador apertando. O trabalho e um so: transformar aquele papel em OFX, Excel ou CSV sem conferir lancamento por lancamento na planilha.

Nao e publico de fintech gringa nem de dashboard. E gente que ja viu boleto, carnê, carimbo e recibo termico.

### Brand Personality

Tres palavras: **preciso, direto, brasileiro**.

A voz e informal e segura. Frases curtas. Sem jargao de IA. O produto nao promete magica: promete conta que fecha. "A gente confere o saldo" e o gesto da marca. Confianca vem de aritmetica, nao de brilho.

Emocao alvo: alivio e certeza. A pessoa precisa sentir "pode baixar" — nao "olha que moderno".

### Aesthetic Direction

A marca visual que ja existe: verde `#0F6B5C`, fundo menta, escudo com check. Isso continua sendo a identidade do produto (app, header, converter). A landing pode ousar mais, mas o verde e o carimbo de "conferido" sao o DNA.

Referencias fisicas (nao sites): mesa de contador com kraft e carimbo vermelho; carnê/boleto brasileiro; vidraça de xerox com linha de scan; recibo termico.

Tema: as 4 versoes do laboratorio exploram cenas diferentes. Nenhuma delas e o reflexo de categoria (navy + dourado, teal de "saude", dark neon de "fintech", editorial com serif italico).

### Anti-referencias

- Landing SaaS generica: 3 cards iguais, icone redondo, "Learn more"
- Fintech cliche: navy, dourado, grafico de crescimento
- "AI slop": gradiente roxo-ciano, glassmorphism, Inter/Space Grotesk, texto em degradê
- Editorial-magazine: serif italico + labels em caixa alta + colunas com filete
- Screenshot de dashboard como hero

### Design Principles

1. **Mostra o resultado, nao o produto.** O hero e a transformacao: PDF ou foto manuscrita vira arquivo conferido. Texto so apoia.
2. **A conta que fecha e o gesto.** Qualquer versao precisa ter um momento em que o saldo bate — carimbo, soma, check. Esse e o "aha".
3. **Brasileiro no objeto, nao na bandeira.** Boleto, carnê, letra de mao, PIX no caderno. Sem verde-amarelo de souvenir.
4. **Uma ideia por dobra.** Hero (transformacao + CTA), prova, como funciona, creditos. Sem card grid identico.
5. **Motion com proposito.** A animacao explica o processo em ~10s. Sem bounce. Respeita `prefers-reduced-motion`.

### Landing laboratorio

Quatro cenas para comparar. A home `/` nao muda ate escolher a vencedora.

| Rota | Cena | Estrategia de cor | Objeto hero |
|---|---|---|---|
| `/laboratorio/mesa` | Mesa do contador | Papel kraft, azul carbono, carimbo vermelho | Foto manuscrita |
| `/laboratorio/carne` | Carne / boleto | Azul de formulario, picote, barra |
| `/laboratorio/scanner` | Xerox / scanner | Luz fria, preto de tinta, amarelo marca-texto | Linha de scan |
| `/laboratorio/carimbo` | Carimbo CONFERIDO | Verde da marca no talo, creme, vermelho | Carimbo que fecha o saldo |

Animacao compartilhada, restilizada por cena: toggle PDF / Foto. PDF = extrato cai, linhas viram lancamentos, monta OFX, saldo fecha. Foto = caderno torto (PIX, aluguel, mercado), endireita, destaca valores, mesmo caminho.

CTA primario: "Converter agora" → `/pdf-para-ofx`. Secundario: entrar / criar conta.

### Product facts (copy)

- Aceita PDF, foto e scan. Bancos de sempre: Nubank, Inter, Itau, Bradesco, BB.
- Se abertura + lancamentos nao fecha com o fechamento, a pessoa confirma antes de baixar.
- 1 conversao gratis na conta. Depois: 1 · R$ 4,90 / 10 · R$ 39,90 / 50 · R$ 149.
- Saida: OFX, Excel ou CSV.
