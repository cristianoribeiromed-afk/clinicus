# PRODUCT-DESIGN-BIBLE.md — A Constituição Visual do Clinicus

> Este documento existe pra uma coisa só: **parar de redecidir cor, fonte e
> tom a cada conversa.** O que está aqui é o que já está implementado em
> `tailwind.config.ts` e `app/globals.css` — não uma proposta nova. Se uma
> ideia futura contradisser este documento, a decisão é: atualizar o
> documento (e o código) de propósito, ou descartar a ideia — nunca as
> duas coisas coexistindo em telas diferentes do mesmo produto.

---

## 1. Personalidade do Clinicus

| Princípio | O que significa na prática |
|---|---|
| **Elegante** | Espaço negro generoso. Nunca comprimir informação só porque cabe. |
| **Médico, não hospitalar** | Tipografia sofisticada (serifada nos títulos). Nunca azul/branco genérico de posto de saúde. |
| **Premium** | Animação suave (150–300ms), nunca chamativa. Se a animação chama mais atenção que o conteúdo, está errada. |
| **Tecnológico** | Um brilho verde discreto — um só, nunca dois elementos competindo por atenção na mesma tela. |
| **Focado** | Cada tela responde uma pergunta. Se precisar de duas frases pra explicar o que uma tela faz, ela faz coisa demais. |

**Regra de ouro:** cada tela deve parecer um aplicativo cuidado, não uma
página de cursinho. Isso não é sobre gastar mais elementos — é sobre
gastar menos, com mais intenção.

---

## 2. Paleta oficial (já implementada — não é proposta)

Fonte: `tailwind.config.ts`, `app/globals.css`. Portada originalmente do
design system real do ClinicusMed (site estático), não inventada do zero.

| Token | Valor | Uso |
|---|---|---|
| `background` | `#030707` | Fundo da aplicação inteira |
| `sidebar` | `#0A0D0D` | Só a sidebar — profundidade sutil em relação ao fundo |
| `card` / `popover` | `#0F1115` | Toda superfície elevada (card, modal, dropdown) |
| `surface-2` | `#171A20` | Hover de superfície, headers internos (ex.: topo do mockup) |
| `primary` | `#1DB954` | Cor de identidade principal — ativo no menu, foco, links, badges |
| `primary-light` | `#7DFFC1` | Glow, hover sobre `primary`, texto em gradiente |
| `secondary` | `#D8A53B` | **Reservado pra ação importante** — CTA principal, upgrade, plano pago. Nunca usado como cor de rotina |
| `border` | `rgba(255,255,255,0.08)` | Toda borda padrão |
| `border-strong` | `rgba(255,255,255,0.14)` | Hover de borda, separadores de destaque |
| `foreground` | `#FFFFFF` | Texto principal |
| `muted-foreground` | `#A5A5A5` | Texto secundário |
| `destructive` | `#EF4444` | Erro, ação destrutiva |
| `success` | `#22C55E` | Confirmação — dado real (ex.: pagamento aprovado), nunca decoração |
| `warning` | `#F59E0B` | Atenção — nunca a mesma função de `secondary` |
| `purple` | `#8B5CF6` | Acento de disciplina (`accentForDisciplina`), não cor de marca |

**Regra sobre `secondary` (dourado):** se aparecer em mais de um botão por
tela, está sendo usado errado. Dourado é para o que realmente importa
economicamente (comprar, assinar, virar premium) — não para "destacar
mais uma coisa".

---

## 3. Tipografia

| Uso | Fonte | Token Tailwind |
|---|---|---|
| Títulos de destaque (hero, H1 de página) | Cormorant Garamond (serifada) | `font-display` |
| Interface, corpo de texto, formulários | Inter | `font-sans` (padrão) |
| Números grandes (estatística, contagem) | Inter SemiBold | `font-sans font-semibold` |

Cormorant Garamond já está carregada (`app/layout.tsx`, via
`next/font/google`) e em uso no hero da home pública. Não trocar por
Canela/Fraunces sem motivo concreto — mudar fonte de novo sem necessidade
é o mesmo problema de "trocar cor de novo".

---

## 4. Componentes oficiais

Claude não inventa variante nova de botão. Usa o que já existe:

| Componente | Onde | Regra |
|---|---|---|
| Botão primário (ação comum) | `<Button>` padrão (verde) | Ações de rotina — "Continuar", "Salvar", "Explorar" |
| Botão de conversão (dourado) | Gradiente `from-secondary to-[#F0C56A]` | Só em CTA de conversão real — "Começar grátis", upgrade. Ver hero (`app/page.tsx`) |
| Card de conteúdo | `ContentCard` (`components/ui/content-card.tsx`) | Linha de currículo — não recriar como card de vitrine |
| Card de disciplina | `app/disciplinas/page.tsx` | Nome → contexto → recursos → ação, nessa ordem, sempre |
| Portão de tela cheia | `UniversidadeGate` | Padrão pra qualquer escolha que precise acontecer antes de tudo o resto |

---

## 5. Microinterações — regras, não sugestões soltas

- Hover em card: elevação leve (translateY ou borda mais clara), nunca as
  duas coisas competindo com uma sombra pesada também.
- Nenhuma animação de entrada por item numa lista longa (ex.: 20 cards
  cada um com fade-and-slide-up individual) — é o efeito mais comum de
  "template genérico de IA", já removido do `ContentCard` de propósito.
- Duração: 150–300ms. Acima disso, a interface parece lenta, não
  premium.
- Glow verde: um por vez, nunca dois elementos brilhando ao mesmo tempo
  na mesma tela.

---

## 6. O que fica de fora até existir dado real

Isso não é uma lista de "não fazer nunca" — é uma lista de "não fazer
**ainda**", porque a base de dado não existe:

- **"Continue de onde parou"** na home ou na landing — precisa de
  progresso real rastreado (não existe hoje, ver P4/ADR-0004 no
  `clinicus-saas`).
- Qualquer número de estatística que não venha de uma consulta real
  (já resolvido uma vez na home pública — não regredir isso).
- Qualquer streak, taxa de acerto ou métrica de desempenho.

## O que dá pra fazer sem esperar nenhuma decisão pendente

- **"Demo viva"** na landing — um flashcard de exemplo que vira sozinho
  uma vez, uma barra decorativa animando, sidebar do mockup respondendo
  a hover. Isso não é dado de usuário, é uma demonstração de como o
  produto funciona — o mesmo espírito do link "Ver simulado demo" que já
  existe no hero. Diferente de "Continue de onde parou": aqui não se
  finge que é o progresso de ninguém.

---

## 7. Como este documento é usado

Antes de propor mudança de cor, fonte ou padrão visual, a pergunta é:
**isso já está aqui, com outro nome?** Se sim, a resposta é aplicar o que
já existe, não redecidir. Se uma mudança de verdade for necessária, ela
atualiza este arquivo explicitamente — nunca fica só numa tela isolada,
com o resto do produto seguindo a regra antiga.
