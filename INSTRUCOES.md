# Hub de ferramentas — especificação

> Renomeie para `INSTRUCOES.md` no repositório novo. Este arquivo é **normativo**: o código deve
> referenciar as seções nos comentários (`§4.1`, `§7.2`...), como no gerador de certificados e no
> visualizador. As escolhas aqui não são preferência — cada uma tem o porquê ao lado, e é o porquê
> que decide se ela pode ser revista.
>
> **Este projeto não herda a stack dos irmãos.** Eles são bancadas de trabalho que rodam offline com
> dado pessoal na tela; este é uma página de conteúdo com um formulário que precisa de servidor. São
> problemas diferentes e a resposta é diferente (§3). O que continua igual é a **cara** (§9) — e por
> escolha, não por inércia.

---

## 1. O que é

A **porta de entrada** das ferramentas internas. Uma página, um card por ferramenta, e um formulário
para pedir ferramenta nova ou avisar de defeito. Quem chega aqui ou já sabe o que quer (clica e vai),
ou não sabe que a ferramenta existe — é para essa pessoa que o hub existe.

Hoje são duas:

| Ferramenta | Endereço | O que faz |
|---|---|---|
| **Gerador de Certificados** | `gerador-certificados-five.vercel.app` | gera um `.docx` por pessoa a partir de um modelo do Word e de uma lista colada |
| **Visualizador de Documentos** | `visualizador-documentos.vercel.app` | abre vários `.docx` de uma vez, empilhados, para conferir na tela |

O hub **não faz o trabalho** — ele aponta. Não abre documento, não gera nada, não embute ferramenta
nenhuma. Cada ferramenta continua no domínio dela, com o repositório dela e a especificação dela.

Interface, comentários de código, nomes de teste e mensagens de erro em **português do Brasil**.

### 1.1 Por que um hub e não uma pasta de favoritos

Favorito é individual e morre quando a pessoa troca de máquina; um endereço só, que dá para mandar
por mensagem, sobrevive. E há uma coisa que favorito nenhum faz: **mostrar o que existe**. Metade do
valor deste projeto é alguém descobrir que o visualizador existe enquanto vinha usar o gerador.

O outro motivo é o formulário. Hoje o pedido de correção chega por mensagem solta, sem contexto e
sem histórico — o §6 existe para que ele chegue com navegador, ferramenta, data e um código para
citar depois.

---

## 2. As decisões que definem o escopo

| Decisão | Escolha | Consequência |
|---|---|---|
| Conteúdo do catálogo | **arquivo TypeScript no repositório** (§4) | acrescentar ferramenta é um commit. Sem CMS, sem banco, sem painel de administração |
| Como a página é entregue | **HTML pronto, gerado no build** (§3) | o catálogo aparece antes de qualquer JavaScript rodar. Numa página cujo trabalho é "mostrar a lista", isso é o produto inteiro |
| Como a ferramenta abre | **nova aba**, `rel="noopener noreferrer"` | o hub continua aberto; quem usa o gerador por vinte minutos não perde a lista |
| Autenticação | **nenhuma** | é um índice de links. Login aqui protegeria o que já não é segredo e afastaria quem só queria clicar |
| Servidor | **existe, e faz uma coisa só: mandar o e-mail** (§7) | nada mais atravessa o servidor. Sem banco, sem sessão, sem log de conteúdo |
| Anexo no formulário | **não existe** (§6.3) | um print da tela do gerador tem a turma inteira com CPF. É o que os outros dois projetos existem para não deixar viajar |

### 2.1 O que este projeto herda dos irmãos, e o que não herda

**Herda:** a paleta, a tipografia, a régua de movimento, o português direto, a disciplina de nunca
descartar em silêncio o que a pessoa escreveu, e o hábito de escrever o porquê ao lado da decisão.
Quem sai do gerador e chega aqui tem que sentir que é a mesma casa (§9).

**Não herda:** a stack (§3), o `connect-src 'none'` (§8) e a ideia de que o app funciona offline.

O `connect-src 'none'` dos irmãos existe porque lá **nada** pode sair — a lista tem CPF. Aqui o
formulário precisa sair, então a regra muda de "fechado" para **estreito**: o app fala com o próprio
servidor e com mais ninguém (§8), o formulário não aceita anexo (§6.3) e o hub não recebe documento,
nem CPF, nem nome de participante em tela nenhuma. Se um dia parecer que precisa, é requisito novo e
discussão nova.

E o offline: o hub é uma lista de endereços de sites. **Um hub que abre sem rede é um hub inútil** —
ele mostraria dois links que não abrem. Nada de service worker aqui (§8).

---

## 3. Stack

### 3.1 A decisão

**Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, na Vercel.**

O que decide não é gosto, é a forma do problema: **uma página quase toda estática mais um endpoint
minúsculo.** Os três caminhos plausíveis:

| Caminho | O que entrega | O que cobra |
|---|---|---|
| **Next.js (App Router)** ✅ | a página sai pronta do build (SSG), o envio do formulário é uma *Server Action* — sem endpoint escrito à mão, sem `fetch`, sem JSON —, os cabeçalhos do §8 são configuração do próprio framework, e `next dev` roda a página **e** o servidor com um comando só | CSP estrita exige *nonce* em `middleware` (§8.1). É uma receita de ~15 linhas, mas é uma peça a mais |
| **Astro + ilha React para o formulário** | manda ainda menos JavaScript (o catálogo vira HTML puro) e a CSP fica trivialmente estrita | o endpoint depende do adaptador da Vercel, e é mais uma ferramenta na sua rotação para dois cards e um formulário |
| **Vite + React SPA** (o dos irmãos) | você já tem dois iguais; copiar é rápido | o catálogo **só existe depois que o JS roda** — HTML vazio para uma página cujo trabalho é mostrar uma lista. E o servidor não é do framework: vira uma pasta `api/` da Vercel, com `vercel dev` como segunda ferramenta de desenvolvimento |

O Vite SPA é o caminho da inércia e é justamente onde ele perde: os irmãos são SPAs porque são
**aplicações** — estado, arquivos, tabela editável. Este é um **documento com um formulário**. O
`index.html` vazio que sustenta o gerador é o formato errado para a página cujo produto é o
conteúdo.

O Astro é a escolha tecnicamente mais enxuta e ficaria ótima. Perde no critério que decide para uma
pessoa só mantendo três repositórios: o Next resolve página, servidor, cabeçalhos e desenvolvimento
local sem nenhuma peça extra, e é o que menos tem chance de virar problema chato num sábado.

### 3.2 O resto

| Camada | Escolha | Por quê |
|---|---|---|
| Estilo | **Tailwind v4**, tokens em `@theme` | os mesmos tokens dos irmãos (§9), colados de lá |
| Componentes | **shadcn/ui**, estilo `new-york` | só os que forem usados: `button`, `card`, `input`, `textarea`, `select`, `alert`, `badge`, `label` |
| Ícones | **lucide-react** | é o ícone de cada card |
| Validação | **zod** | um schema só, do formulário e do servidor (§6.6) |
| Fonte | **`next/font`** com Inter | auto-hospedada e sem *layout shift*; CDN continua proibido (§8) |
| E-mail | **Resend** | §7.1 |
| Lint | **ESLint** (o que vem com `create-next-app`) | o oxlint dos irmãos foi escolhido pela velocidade num repositório grande; aqui o padrão do framework custa zero configuração e entende as regras do Next |
| Teste | **Vitest** + `@testing-library/react` | §11 |
| Gerenciador | **pnpm** | igual aos irmãos, e é o que você já tem |

### 3.3 O que NÃO entra

- **Biblioteca de formulário** (`react-hook-form`, `formik`). São seis campos, um `useActionState` e
  um `safeParse`. A biblioteca traria mais conceito que código.
- **Banco de dados, ORM, autenticação.** §2 e §12.
- **Analytics, pixel, mapa de calor.** O hub é a única página da família que *poderia* medir acesso,
  e é por isso que a tentação precisa estar escrita aqui como recusada: script de terceiro nesta
  origem é script de terceiro do lado do formulário. Se a pergunta "quantas pessoas usam" precisar
  de resposta, ela vem do log do próprio servidor, não de um script de fora.
- **Service worker / PWA.** §2.1 — offline aqui não serve para nada.
- **Iframe embutindo as ferramentas.** Além de ser pior que abrir a ferramenta, **não funciona**: a
  CSP dos dois irmãos traz `frame-ancestors 'none'`.
- **CMS, Notion, planilha como fonte do catálogo.** Cada um vira uma chamada de rede, uma chave e um
  ponto de falha para renderizar dois cards. O §4 é um `.ts` de 40 linhas.

---

## 4. O catálogo

**Fonte única da verdade: `lib/ferramentas.ts`.** Um array exportado e tipado, lido no build. Sem
rede, sem importação dinâmica. Acrescentar ferramenta é editar esse arquivo e fazer deploy — e o
TypeScript recusa a entrada incompleta antes do commit.

### 4.1 O tipo

```ts
export type EstadoFerramenta = 'ativa' | 'beta' | 'construcao' | 'planejada'

export interface Ferramenta {
  /** estável; entra na URL (`?ferramenta=`) e no e-mail de toda solicitação. Nunca reaproveite */
  id: string
  nome: string
  /** uma linha, na tela do card. Sem ponto final, sem "esta ferramenta permite" */
  resumo: string
  /** duas ou três linhas: o problema que ela resolve, na língua de quem tem o problema */
  descricao: string
  /** ausente quando `estado` é 'planejada' — é o que faz o card não ser clicável (§4.3) */
  url?: string
  estado: EstadoFerramenta
  /** ícone do lucide-react. Um por ferramenta, nunca repetido */
  icone: LucideIcon
  /** para a busca do §5.4 e para agrupar quando forem muitas */
  tags: string[]
  /** o que a ferramenta faz com os dados. Vira o selo do card (§5.3) */
  privacidade: 'local' | 'servidor'
  /** opcional; só aparece se existir */
  repositorio?: string
  /** ISO `AAAA-MM-DD`. Alimenta o selo "novidade" do §13.2 */
  atualizadaEm?: string
}
```

Três regras que o resto assume:

1. **`id` é para sempre.** Ele aparece na URL e no e-mail de toda solicitação já enviada. Trocar o
   `id` quebra o histórico da caixa de entrada.
2. **`url` ausente é o sinal de "ainda não existe".** Não use `url: '#'` nem string vazia — o card
   decide se é link ou bloco inerte pela presença do campo, e string vazia produz um link que
   recarrega a página.
3. **`privacidade` é declaração, não enfeite.** `'local'` significa que a ferramenta não manda dado
   para servidor nenhum. É a informação mais valiosa que o hub carrega: quem confia nela usa a
   ferramenta com a lista de verdade, em vez de com dados de mentira.

### 4.2 As duas de hoje

```ts
export const FERRAMENTAS: Ferramenta[] = [
  {
    id: 'gerador-certificados',
    nome: 'Gerador de Certificados',
    resumo: 'Um certificado por pessoa, a partir de um modelo do Word',
    descricao:
      'Você sobe o modelo .docx, cola a lista da turma (nome e CPF) e baixa um .zip com um ' +
      'arquivo por pessoa. Trata concordância de Sr./Sra., notas e média final, e guarda quem já ' +
      'foi certificado para conferir a lista da próxima turma.',
    url: 'https://gerador-certificados-five.vercel.app',
    estado: 'ativa',
    icone: Award,
    tags: ['certificado', 'docx', 'turma', 'cipa', 'integração'],
    privacidade: 'local',
  },
  {
    id: 'visualizador-documentos',
    nome: 'Visualizador de Documentos',
    resumo: 'Abre vários .docx de uma vez, empilhados para conferir',
    descricao:
      'Arraste 3 ou 300 arquivos: eles aparecem um abaixo do outro, com índice lateral, sem abrir ' +
      'o Word trinta vezes. Serve para conferir os certificados recém-gerados de uma passada só.',
    url: 'https://visualizador-documentos.vercel.app',
    estado: 'ativa',
    icone: Files,
    tags: ['docx', 'conferência', 'leitura'],
    privacidade: 'local',
  },
]
```

> `gerador-certificados-five.vercel.app` é o endereço automático da Vercel, com o `-five` que ela
> inventou para desempatar o nome. Funciona, mas é o tipo de endereço que ninguém decora e que
> parece errado quando colado numa conversa — vale renomear o projeto na Vercel (ou apontar um
> domínio) **antes** de o hub começar a circular, porque depois o endereço velho já estará escrito
> em mensagem de todo mundo. O hub é o único lugar que precisa ser decorado; as ferramentas podem
> ficar em `*.vercel.app`, mas de preferência num que se leia.
>
> Ferramenta ainda sem endereço entra como `estado: 'construcao'` **sem `url`** — o hub não pode ter
> card que leva a lugar nenhum, porque a primeira pessoa que clicar vai concluir que o hub inteiro
> está quebrado.

### 4.3 Os quatro estados

| Estado | Card | Para que serve |
|---|---|---|
| `ativa` | clicável, sem selo | o caso normal |
| `beta` | clicável, selo âmbar "em teste" | avisa que pode ter defeito **antes** de a pessoa depender do resultado |
| `construcao` | **não** clicável, selo cinza "em construção" | existe, está sendo feita, ainda não tem endereço |
| `planejada` | **não** clicável, selo cinza "planejada" | foi pedida e vai ser feita. É o que fecha o ciclo do §6 |

`planejada` é o estado que faz o formulário valer a pena: quem pediu uma ferramenta há dois meses
abre o hub e vê o próprio pedido listado. Sem isso, solicitação vira mensagem enviada para o vazio —
e a pessoa para de mandar.

Card não clicável é **bloco inerte, não link desabilitado**: sem `<a>`, sem `cursor: pointer`, sem
`aria-disabled`. Link que não leva a lugar nenhum é pior que ausência de link.

---

## 5. A página

Três blocos empilhados: cabeçalho, catálogo, formulário. **Uma rota só** (`/`) — o formulário é uma
seção ancorada em `#solicitar`, não uma página. Motivo: o link `…/#solicitar` precisa ser mandável
por mensagem, e uma segunda rota separaria o pedido do catálogo que ele deveria estar olhando.

### 5.1 Cabeçalho

Fino (56px): marca à esquerda (`public/marca.svg`, altura 28px), divisor vertical `cinza-200`,
título **"Ferramentas"** e a linha de apoio em 12px `cinza-500`. À direita, um botão `outline`
"Pedir ou relatar" que rola até o formulário.

**O botão do cabeçalho é `outline`, não azul.** O único primário da página é o "Enviar solicitação"
(§9) — e o herói desta tela é o catálogo.

### 5.2 O desenho

```
┌────────────────────────────────────────────────────────────────────┐
│  ▣  Ferramentas                            [ Pedir ou relatar ]    │
│     Ferramentas internas de Segurança do Trabalho                  │
└────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────┐   ┌──────────────────────────┐
   │ ▣  Gerador de            │   │ ▣  Visualizador de       │
   │    Certificados          │   │    Documentos            │
   │                          │   │                          │
   │ Um certificado por       │   │ Abre vários .docx de     │
   │ pessoa, a partir de um   │   │ uma vez, empilhados      │
   │ modelo do Word           │   │ para conferir            │
   │                          │   │                          │
   │ 🔒 Fica no seu navegador │   │ 🔒 Fica no seu navegador │
   │                       ↗  │   │                       ↗  │
   └──────────────────────────┘   └──────────────────────────┘

   ─────────────────────────────────────────────────────────────

   Precisa de uma ferramenta que não está aqui?            #solicitar
   ┌────────────────────────────────────────────────────────────────┐
   │  formulário (§6)                                               │
   └────────────────────────────────────────────────────────────────┘

   As ferramentas rodam no seu navegador. Só o formulário acima envia algo.
```

Grade `minmax(280px, 1fr)`, **máximo de 3 colunas** mesmo em tela larga — com duas ferramentas,
quatro colunas deixam dois cards espremidos num canto e três metros de vazio. Largura máxima da
página 1120px (menor que os 1440px do gerador: lá o herói é uma tabela que cresce, aqui são cards
que não devem virar faixas). Abaixo de 720px, uma coluna.

### 5.3 O card

Branco, borda `cinza-200` de 1px, raio 10px, padding 24px. Dentro, em ordem: ícone 20px em
`brand-700` e nome em 18px medium; selo de estado quando não for `ativa` (§4.3); resumo em 14px
`cinza-900` e descrição em 13px `cinza-500`; selo de privacidade — `🔒 Fica no seu navegador`
(`local`, em `sucesso`) ou `↗ Passa por um servidor` (`servidor`, em `cinza-500`); e o ícone de link
externo, 14px `cinza-500`, no canto inferior direito.

O card inteiro é a área clicável — um `<a>` embrulhando tudo, não um botão "Abrir" no rodapé. Alvo
grande é mais fácil de acertar, e o card já é a unidade que a pessoa enxerga.

**Hover discreto:** borda passa a `brand-300`, fundo a `brand-50`. Sem elevar, sem escalar, sem
sombra.

**Abre em nova aba**, e o card diz isso: o ícone de link externo está lá para isso, e o `aria-label`
termina com "(abre em nova aba)". `rel="noopener noreferrer"` é obrigatório — sem `noopener` a
página aberta recebe `window.opener` e pode mexer nesta.

**O card é um Server Component.** Ele não tem estado, não tem evento, não precisa de JavaScript
nenhum no navegador — e é isso que faz o catálogo aparecer instantaneamente e continuar aparecendo
mesmo que o JS falhe. Se um dia alguém precisar pôr `'use client'` num card, a mudança merece
pergunta antes.

### 5.4 Busca — só quando fizer falta

Com duas ferramentas, campo de busca é mobília: a pessoa lê as duas mais rápido do que digita.

**Regra:** o campo aparece a partir de `MOSTRAR_BUSCA_A_PARTIR_DE = 7` ferramentas *ativas*. A
constante mora sozinha em `lib/limites.ts` — um número, um lugar.

Quando aparecer: filtra por `nome`, `resumo` e `tags` (não por `descricao` — casar no texto longo
devolve tudo), sem acento e sem caixa, e `/` foca o campo. Nada de resultado vazio mudo: *"Nenhuma
ferramenta com «xyz». Pede pelo formulário abaixo?"*, com o texto já preenchido no formulário. É a
partir daqui que a grade vira Client Component — e só ela.

### 5.5 Teclado

`Tab` percorre os cards na ordem do catálogo — o que sai de graça por serem `<a>` de verdade. Nada
de `tabIndex` rotativo: a lista tem 2 a 10 itens, não é a tabela de trinta linhas do gerador, e a
navegação nativa é a que o leitor de tela já anuncia.

`/` foca a busca, quando ela existir (§5.4) e o foco não estiver num campo de texto — vale copiar o
`ehEntradaDeTexto` do `lib/keyboard.ts` do gerador. **Nada de atalho de letra para "abrir a
ferramenta N"**: a página tem um formulário, e é o mesmo motivo pelo qual o WASD foi descartado lá.

---

## 6. O formulário

### 6.1 O que ele pergunta

| Campo | Tipo | Obrigatório | Nota |
|---|---|---|---|
| Tipo | 4 botões de escolha | sim | **defeito** · **melhoria** · **ferramenta nova** · **dúvida** |
| Ferramenta | `select` do catálogo + "outra / nenhuma" | sim | pré-selecionada por `?ferramenta=` |
| Assunto | `input`, até 120 caracteres | sim | vira o assunto do e-mail |
| Descrição | `textarea`, até 4000 caracteres | sim | `placeholder` muda conforme o tipo (§6.2) |
| Seu nome | `input` | sim | quem pediu |
| Seu e-mail | `input type="email"` | sim | vira o `Reply-To` (§7.4) — é o que permite responder |

**Seis campos e nada mais.** Urgência, setor, prioridade e "quantas pessoas isso afeta" foram
considerados e cortados: quem recebe é uma pessoa só, que lê tudo, e cada campo a mais é uma chance
a mais de desistir no meio. Prioridade se conversa respondendo o e-mail.

Contador de caracteres só quando faltarem menos de 200 — contador desde o primeiro caractere faz a
pessoa escrever menos, que é o oposto do que se quer numa descrição de defeito.

### 6.2 O `placeholder` faz a pergunta certa

O tipo escolhido troca o `placeholder` da descrição, porque a diferença entre um relato útil e um
inútil é saber o que contar:

- **defeito** — *"O que você fez, o que esperava que acontecesse e o que aconteceu. Se souber em
  qual passo foi, diga: «no passo 3, ao clicar em gerar»."*
- **melhoria** — *"O que é chato hoje e como seria melhor. Pode contar como você faz atualmente."*
- **ferramenta nova** — *"Que trabalho manual você quer parar de fazer? Quanto tempo ele leva e com
  que frequência acontece?"*
- **dúvida** — *"O que você está tentando fazer."*

Trocar `placeholder` **não apaga** o que já foi digitado. Se o texto sumisse ao trocar o tipo,
alguém perderia dez minutos de escrita — e é exatamente o tipo de coisa que só teste de componente
pega (§11).

### 6.3 Nada de anexo — e este é o ponto mais importante da seção

Anexar print parece óbvio para relatar defeito, e está **fora de escopo, com motivo**:

> Um print da tela do gerador no meio do trabalho tem a **turma inteira, com nome e CPF**. Aceitar
> anexo aqui seria montar, dentro da família de projetos que existe para o dado pessoal não sair da
> máquina, o único caminho por onde ele sai — e por e-mail, que é o meio mais difícil de apagar
> depois.

O que um print costuma provar é *qual navegador, qual tela, qual passo* — e isso o §6.4 manda
sozinho. Para o resto, a descrição em texto resolve, e o e-mail de resposta é onde se combina mandar
uma imagem por outro canal, aí com a decisão consciente de quem tem o dado na mão.

Se um dia mudar, muda com upload para armazenamento com prazo de expiração, aviso na tela e limpeza
automática — não com anexo dentro do e-mail.

### 6.4 O contexto vai junto, e a pessoa vê qual é

Junto da mensagem seguem: navegador e sistema (`navigator.userAgent`), tamanho da janela, idioma,
data e hora com fuso, e o `id` da ferramenta escolhida. É o que responde "só acontece no Firefox" e
"a tela dela é pequena" sem uma rodada de perguntas.

**Isso fica visível**, num bloco recolhido "o que vai junto com a sua mensagem", em 12px
`cinza-500`. Mandar dado do navegador de alguém sem dizer que está mandando é o tipo de coisa que,
descoberta depois, custa a confiança que a família passou três projetos construindo.

Nada de fingerprint, nada de identificador persistente.

### 6.5 O aviso de dado pessoal

Acima do botão de enviar, um `alert` em `aviso` — sempre visível, não só quando dá erro:

> **Não cole lista de pessoas, CPF ou trecho de documento aqui.** Esta é a única tela da família que
> envia algo para fora do seu computador. Para relatar um defeito, descreva o que aconteceu.

E uma checagem antes de enviar: se a descrição casar com padrão de CPF
(`\d{3}\.?\d{3}\.?\d{3}-?\d{2}`) ou tiver três ou mais linhas no formato `número. NOME`, o envio
**para** e mostra: *"Parece que tem CPF aí. Tire os dados das pessoas e mande de novo."*

É aviso com bloqueio, não bloqueio silencioso: o texto continua no campo, ela edita e reenvia. E é
heurística, não garantia — o servidor recusa de novo (§7.6), porque validação de cliente é
conveniência e a do servidor é a que vale.

### 6.6 O schema é um só

`lib/solicitacao.ts` exporta o schema zod, importado **pelo formulário e pela Server Action**. Dois
schemas é a receita de aceitar no navegador o que o servidor recusa, e a pessoa fica olhando um erro
genérico sem saber qual campo consertar.

```ts
export const solicitacaoSchema = z.object({
  tipo: z.enum(['defeito', 'melhoria', 'ferramenta', 'duvida']),
  ferramentaId: z.string().min(1).max(64),
  assunto: z.string().trim().min(5).max(120),
  descricao: z.string().trim().min(20).max(4000),
  nome: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  contexto: z.object({
    userAgent: z.string().max(400),
    tela: z.string().max(40),
    idioma: z.string().max(20),
    enviadoEm: z.string().max(40),
  }),
  /** honeypot: sempre vazio para gente de verdade (§7.5) */
  site: z.string().max(0).optional(),
})

export type Solicitacao = z.infer<typeof solicitacaoSchema>
```

Os `max` não são decoração: são o que impede alguém de mandar 4 MB de texto pelo servidor (§7.5).

### 6.7 Depois de enviar

O card do formulário dá lugar a uma confirmação com **o código do protocolo** (§7.4):

```
✓ Recebido — SOL-2026-0811-A3F2

  Sua mensagem foi enviada para quem cuida das ferramentas.
  A resposta vai para o e-mail que você informou.

  [ Copiar o texto da solicitação ]   [ Mandar outra ]
```

"Copiar o texto" existe porque e-mail se perde e caixa de entrada enche. Com o texto na mão, a
pessoa reenvia por outro canal sem reescrever nada.

**Sem toast comemorando.** A confirmação na tela é o aviso — mesma disciplina dos irmãos.

### 6.8 Quando o envio falha

Falha de rede, provedor fora do ar, chave vencida — tudo cai no mesmo lugar, e a regra é uma só: **o
texto não se perde.**

```
⚠ Não consegui enviar.

  O texto continua aqui embaixo, inteiro.

  [ Tentar de novo ]   [ Copiar o texto ]   [ Abrir no meu e-mail ]
```

"Abrir no meu e-mail" é um `mailto:` com assunto e corpo já preenchidos. É a saída de emergência que
não depende de nada deste projeto estar funcionando — e custa dez linhas, escritas justamente para o
dia em que o resto não funciona.

> Note que o `mailto:` **precisa do endereço de destino no navegador**, e o §7.3 mantém esse
> endereço fora do bundle. A saída: o botão só aparece **depois** de uma falha, e busca o endereço
> numa Server Action mínima (`endereçoDeContato()`). Se isso parecer exagero, a alternativa honesta
> é aceitar o endereço no HTML e conviver com robô de coleta — mas escolha, não descubra depois.

---

## 7. O servidor — uma ação, e só

### 7.1 Por que Server Action + Resend

A pergunta era "dependendo faz um back, se não for complicar o deploy". Com Next na Vercel **não
existe deploy de backend**: a Server Action é uma função `async` no repositório, o mesmo `git push`
publica tudo, e `next dev` roda ela localmente sem segunda ferramenta.

As alternativas, e o que cada uma cobra:

| Caminho | O que entrega | O que cobra |
|---|---|---|
| **`mailto:` puro** | zero servidor, zero chave, zero custo | depende de a máquina ter cliente de e-mail configurado — em muita máquina corporativa o link não faz nada. Sem confirmação de entrega, sem protocolo, e o endereço fica no HTML para todo robô coletar |
| **Formspree / Web3Forms / Getform** | um `POST` e pronto | o conteúdo passa por um terceiro que ninguém auditou, o plano grátis limita e às vezes marca o e-mail, e a CSP precisa abrir para o domínio deles — o oposto do §2.1 |
| **Server Action + Resend** ✅ | o dado vai do navegador para a sua função e dela para o e-mail. Chave fora do navegador, formato do e-mail sob controle, protocolo, `Reply-To`, e o formulário **funciona até sem JavaScript** (§7.2) | uma chave de API para guardar e um domínio para verificar no Resend |
| **Server Action + SMTP da instituição** | não depende de serviço novo; sai do endereço da própria casa | credencial de SMTP em variável de ambiente, e SMTP corporativo costuma recusar autenticação de fora da rede. Ver §7.7 |

**Recomendação: Server Action + Resend.** É a que mantém a única saída de dados dentro de código que
você escreveu, e a que dá para depurar quando o e-mail não chegar.

### 7.2 A ação

`app/acoes/solicitar.ts`, com `'use server'` no topo. O formulário a usa por `useActionState`, e o
`<form action={...}>` do React faz o resto.

```ts
'use server'

import { Resend } from 'resend'
import { solicitacaoSchema } from '@/lib/solicitacao'

export async function enviarSolicitacao(_estado: Estado, dados: FormData): Promise<Estado> {
  // 1. safeParse do FormData com o schema do §6.6 — recusa devolve o campo, não uma frase genérica
  // 2. honeypot preenchido ou envio rápido demais → sucesso mentiroso, sem enviar nada (§7.5)
  // 3. checagem de dado pessoal, de novo (§7.6)
  // 4. gera o protocolo (§7.4)
  // 5. envia; erro do provedor → { erro: 'nao-enviou' }, com o detalhe só no log
  // 6. devolve { protocolo }
}
```

Cinco regras de dentro dela:

1. **A ação é a fronteira de confiança.** Server Action é um endpoint público com outro nome:
   qualquer um pode chamá-la com o corpo que quiser. Tudo que o §6 valida na tela é validado aqui de
   novo, sem exceção.
2. **A resposta nunca ecoa o que chegou.** Devolve o protocolo, ou o nome do campo inválido. Mais
   nada.
3. **Erro do provedor não vaza para a tela.** `console.error` com o detalhe, e para a pessoa
   *"Não consegui enviar agora."* — o §6.8 já dá as saídas.
4. **Nada é guardado.** Sem banco, sem log do conteúdo da mensagem. A caixa de entrada é o arquivo —
   e o que não é guardado não vaza.
5. **O formulário funciona sem JavaScript.** `<form action={acaoDoServidor}>` envia mesmo com o JS
   desligado ou ainda não carregado. Ganho de graça que vale manter: não introduza um
   `onSubmit={e => e.preventDefault()}` para "melhorar" o envio. O que se perde sem JS é o contexto
   do §6.4 e a checagem do §6.5 — os dois degradam sozinhos, porque o servidor refaz a checagem e o
   contexto é opcional no schema.

### 7.3 As variáveis de ambiente

| Variável | Exemplo | Onde |
|---|---|---|
| `RESEND_API_KEY` | `re_…` | Vercel → Settings → Environment Variables |
| `EMAIL_DESTINO` | `otavioku@sae.com.br` | idem |
| `EMAIL_REMETENTE` | `ferramentas@seu-dominio.com.br` | idem, e verificado no Resend |

> **Nunca prefixe nenhuma delas com `NEXT_PUBLIC_`.** O Next embute no bundle tudo que começa com
> `NEXT_PUBLIC_`, e a chave iria para o navegador de quem abrir a página. Elas são lidas só dentro
> de código com `'use server'`.

O endereço de destino fica em variável, e não no código, para não estar no bundle nem no
repositório — endereço em HTML é endereço coletado por robô (e é o §6.8 que trata a exceção).

Localmente, `.env.local`, no `.gitignore`. Sem as variáveis, a ação deve falhar **na primeira linha,
com mensagem clara** ("falta RESEND_API_KEY"), e não no meio do envio.

### 7.4 O e-mail que chega

```
De:        Ferramentas <ferramentas@seu-dominio.com.br>
Para:      otavioku@sae.com.br
Responder: Maria Silva <maria@…>            ← é isto que faz "Responder" funcionar
Assunto:   [defeito · Gerador de Certificados] Não gera quando o nome tem acento
```

Corpo em texto puro, nesta ordem: protocolo, tipo, ferramenta, quem pediu, a descrição inteira e, no
fim, o contexto do §6.4. Texto puro de propósito — sobrevive a qualquer cliente, não cai em filtro
por conter HTML, e é o que dá para colar num chamado.

**O `Reply-To` é a peça que fecha o ciclo**: o remetente é fixo (tem que ser do domínio verificado),
mas responder o e-mail responde para quem pediu, sem copiar endereço à mão.

**O protocolo** é `SOL-AAAA-MMDD-XXXX`, com quatro caracteres aleatórios. Vai no assunto, no corpo e
na tela (§6.7): serve para a pessoa citar ("mandei a SOL-2026-0811-A3F2") e para achar na caixa de
entrada. Não identifica nada — não há banco.

### 7.5 Abuso

Formulário público que manda e-mail é formulário que robô encontra. Três defesas, todas baratas e
sem estado:

- **Honeypot.** Um campo `site`, escondido por CSS (não por `type="hidden"`, que robô também
  ignora), sempre vazio para gente. Preenchido → **sucesso com protocolo falso**, sem enviar nada.
  Devolver erro ensina o robô a tentar de novo.
- **Tempo mínimo.** Menos de 3 segundos entre a página montar e o envio é robô. Mesmo tratamento.
- **Tamanho.** Os `max` do §6.6. Sem eles, um corpo de 4 MB é aceito, processado e vira um e-mail
  que ninguém abre.

Rate limit de verdade (por IP, com contador) exige estado compartilhado — Vercel KV ou Upstash — e
**fica fora do v1**: duas dependências e uma chave a mais para um formulário que talvez receba uma
mensagem por semana. Se chegar spam, a ordem é: primeiro o modo de desafio do firewall da Vercel (é
um botão), depois KV.

> Server Action já vem com proteção de origem embutida no Next (ela recusa requisição cuja origem
> não bate com o host). Isso substitui a checagem de `Origin` que um endpoint escrito à mão
> precisaria — mas **não** substitui nada acima: nenhuma delas é sobre CSRF, e sim sobre robô.

### 7.6 A checagem de CPF também é do servidor

O §6.5 checa no navegador porque é lá que dá para explicar bem. A ação **checa de novo** e recusa.
Motivo: o cliente é opcional — dá para chamar a ação direto — e a promessa da família é que dado
pessoal não trafega. Promessa que só o formulário sustenta não é promessa.

### 7.7 Se preferir o SMTP da instituição

Vale quando a exigência for "o e-mail tem que sair de um endereço da casa" ou quando não houver
domínio para verificar no Resend. Troca o corpo da ação por `nodemailer`, com host, porta, usuário e
senha em variáveis. Duas consequências:

- **Continua no runtime Node** (o Edge não abre socket TCP). Não mova esta ação para o Edge.
- Muitos servidores corporativos **recusam autenticação vinda de fora da rede** ou exigem liberação
  de IP — e o IP de uma função serverless não é fixo. Confirme isso **antes** de escolher este
  caminho; descobrir depois é reescrever a ação e ainda ficar sem e-mail.

Nada mais muda: schema, formulário, protocolo e tratamento de erro são os mesmos.

---

## 8. Segurança e cabeçalhos

Os cabeçalhos vão em `next.config.ts`, em `headers()` — **cabeçalho de verdade, não `<meta>`**. É uma
melhoria em relação aos irmãos, e a diferença é concreta: `frame-ancestors` é *ignorada* quando vem
por `<meta>`; nos dois irmãos ela está lá por herança e não faz nada.

```
default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic';
style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';
connect-src 'self'; form-action 'self'; frame-ancestors 'none';
object-src 'none'; base-uri 'none'
```

Mais `X-Content-Type-Options: nosniff` e `Referrer-Policy: no-referrer` — sem o segundo, cada clique
num card manda o endereço do hub como referência para o site da ferramenta.

Duas diferenças em relação aos irmãos, e as duas são consequência do §2.1:

- **`connect-src 'self'`** no lugar de `'none'`: o app fala com o próprio servidor e com mais
  ninguém.
- **`form-action 'self'`** no lugar de `'none'`: o envio é um `<form>` de verdade (§7.2), então
  fechá-lo quebraria o formulário. `'self'` continua impedindo POST para fora.

### 8.1 O *nonce*, que é o preço do Next

O App Router injeta `<script>` inline (é assim que o RSC entrega o conteúdo), então `script-src
'self'` sozinho **quebra a página**. As saídas são `'unsafe-inline'` (que anula a proteção) ou um
*nonce* gerado por requisição num `middleware.ts` e repassado ao Next — receita documentada, ~15
linhas.

**Faça o nonce.** É a única parte deste projeto que existe só por causa da escolha de framework
(§3.1), e é o momento de lembrar que ela foi consciente. Se um dia o nonce virar dor, a rota de
fuga é o Astro, e ela custa reescrever as telas — não a lógica.

**Nada de CDN**, pelo motivo de sempre: quebra a CSP e põe script de terceiro na origem que tem o
formulário. A fonte é auto-hospedada por `next/font`.

---

## 9. Design

**A cara é a mesma dos irmãos, e isso é escolha, não herança de stack.** Quem usa os três não deve
perceber que são projetos diferentes — e nada disso depende de qual framework desenha. Os tokens do
`@theme` (`brand-*`, `cinza-*`, `sucesso`/`aviso`/`erro`) são copiados do `src/index.css` do gerador
sem alteração; hex solto não entra.

- Fundo `cinza-50`, cards brancos com borda `cinza-200` de 1px.
- **Um único botão primário azul: "Enviar solicitação".** O do cabeçalho é `outline`, e o card é um
  link. Se houver dois azuis, um deles está errado.
- Sem sombra fora de elemento flutuante — e aqui só o `select` é um.
- Cor nunca é o único sinal: os selos de estado e de privacidade levam ícone + texto.
- Inter por `next/font`; escala e pesos do §9.2 do gerador (máximo 600, sem CAPS).
- Movimento na mesma régua: 4–12px, 150–260ms, uma curva só, `prefers-reduced-motion` desliga tudo.
  **Anime a confirmação do §6.7 e o alerta de erro** — os dois aparecem. Não anime os cards na
  carga: fade-in na primeira visita atrasa a leitura do que a pessoa veio ler.
- Rodapé de uma linha, `cinza-500`: *"As ferramentas rodam no seu navegador. Só o formulário envia
  algo."* — é a informação de confiança desta tela, e é diferente da dos irmãos de propósito.

**Onde o hub pode se soltar:** os irmãos são bancadas de trabalho onde a interface some para o
conteúdo aparecer. Este é uma porta de entrada, vista uma vez por semana por trinta segundos — pode
ter mais ar, título maior e um card mais generoso. O que **não** muda é a paleta, a régua de
movimento e a regra do azul único.

**O celular importa mais aqui do que nos irmãos**: hub é o que se manda por mensagem, e mensagem se
abre no telefone. Uma coluna, cards de largura cheia, formulário legível — sem otimização além
disso.

### 9.1 O link compartilhado

O hub vai ser colado em conversa, então o *preview* faz parte do produto: `metadata` com título,
descrição e `opengraph-image` (pode ser gerada em build com `ImageResponse`). Um link sem preview
parece link suspeito, e é a primeira impressão de quem nunca ouviu falar das ferramentas.

---

## 10. Estrutura de arquivos

```
app/
  layout.tsx                 # fonte, metadata, OG (§9.1)
  page.tsx                   # Server Component: cabeçalho + catálogo + formulário
  opengraph-image.tsx
  acoes/
    solicitar.ts             # 'use server' — a única ação (§7.2)
middleware.ts                # nonce da CSP (§8.1)
next.config.ts               # cabeçalhos (§8)
components/
  ui/                        # shadcn
  Cabecalho.tsx
  CardFerramenta.tsx         # §5.3 — sem 'use client'
  GradeFerramentas.tsx       # §5.2; vira client só quando a busca existir (§5.4)
  FormularioSolicitacao.tsx  # 'use client' — §6
  ContextoEnviado.tsx        # o bloco recolhido do §6.4
  Confirmacao.tsx            # §6.7 e §6.8
  Rodape.tsx
lib/
  ferramentas.ts             # O CATÁLOGO (§4) — fonte única da verdade
  solicitacao.ts             # schema zod compartilhado (§6.6)
  contexto.ts                # monta o objeto do §6.4
  dadoPessoal.ts             # a heurística de CPF/lista (§6.5) — pura, testável
  protocolo.ts               # SOL-AAAA-MMDD-XXXX (§7.4)
  limites.ts                 # MOSTRAR_BUSCA_A_PARTIR_DE (§5.4)
  busca.ts                   # normaliza acento/caixa e filtra (§5.4)
  email.ts                   # monta o corpo do e-mail (§7.4) — puro, testável
tests/
```

Duas coisas que a estrutura está dizendo: **quase nada é `'use client'`** (só o formulário e, um
dia, a busca), e **toda a lógica está em `lib/` como função pura**, para que o §11 não precise
montar tela para testar regra.

---

## 11. Testes

Vitest + Testing Library.

### Lógica

- `solicitacao.ts`: aceita o caso bom; recusa assunto curto, descrição curta, e-mail inválido,
  descrição de 5000 caracteres, honeypot preenchido.
- `dadoPessoal.ts`: pega CPF com e sem pontuação; pega três linhas no formato `1. NOME`; **não**
  pega telefone, CEP, número de processo nem data — falso positivo aqui bloqueia quem só queria
  relatar um defeito, e é o defeito mais provável deste módulo.
- `protocolo.ts`: formato correto, e dois seguidos não saem iguais.
- `email.ts`: o assunto tem tipo e nome da ferramenta; o corpo tem a descrição inteira e o contexto
  no fim.
- `busca.ts`: `"certificado"` acha, `"CERTIFICADO"` acha, `"certificados"` acha, e **busca vazia
  devolve tudo**.
- `ferramentas.ts`: `id` único, todo card `ativa`/`beta` tem `url`, nenhum `planejada` tem `url`.
  Parece bobo até alguém acrescentar a décima ferramenta às pressas.

### Da ação (sem rede)

Chamando `enviarSolicitacao` direto, com um `FormData` montado à mão e o SDK do Resend substituído
por um espião: honeypot → sucesso **sem chamar o envio** (é o teste que prova o §7.5); dados
inválidos → devolve o campo, sem enviar; dados válidos → chama o envio uma vez, com `replyTo` igual
ao e-mail de quem pediu; CPF na descrição → recusa (§7.6).

### O que só teste de componente pega

- Trocar o tipo **não apaga** a descrição já digitada (§6.2).
- Descrição com CPF **não envia**: a ação não é chamada e o texto continua no campo (§6.5).
- Falha do envio mantém o texto e mostra as três saídas do §6.8.
- Envio bom troca o card pela confirmação **com o protocolo** que a ação devolveu (§6.7).
- Card `planejada` **não é link** — nada de `role="link"` na árvore (§4.3).
- Todo card externo tem `rel` com `noopener` (§5.3).
- `?ferramenta=visualizador-documentos` chega com o `select` naquela ferramenta.

---

## 12. Fora de escopo

Registrado para não voltar como "seria fácil adicionar":

- **Login, perfil, permissão.** §2.
- **Painel de administração do catálogo.** Editar `ferramentas.ts` é mais rápido que a tela que
  editaria `ferramentas.ts`.
- **Acompanhar a solicitação** ("em análise", "resolvido"). Precisaria de banco, de identidade e de
  alguém mantendo o estado — vira sistema de chamados, que é outro produto. O que fecha o ciclo aqui
  é o estado `planejada` (§4.3), que custa uma linha.
- **Anexo.** §6.3.
- **Analytics.** §3.3.
- **Embutir as ferramentas em iframe.** §3.3 — nem funcionaria.
- **Notificação por e-mail quando uma ferramenta é atualizada.** Precisa de lista de inscritos,
  descadastro e base legal para guardar endereço. Desproporcional.
- **Offline / PWA.** §2.1.
- **Tema escuro.** Fora de escopo nos três; deixe os tokens como variáveis para não travar depois.

Fora do **v1**, mas não fora do futuro — e a distinção importa: as ideias grandes do §13.5 (validação
por QR, controle de validade, cadastro sincronizado) não estão nesta lista. Elas não foram recusadas,
foram adiadas, e cada uma tem no §13.6 o critério para entrar.

---

## 13. Ideias avaliadas — o que vale e o que não vale

Esta seção existe porque a pergunta foi "me dê sugestões". Cada uma com o veredicto, para que
reabrir seja escolha e não descoberta.

### 13.1 Vale, e cabe no v1

- **Selo de privacidade no card** (§5.3). É a informação que faz alguém usar a ferramenta com a
  lista de verdade em vez de com dados de mentira. Custa um campo no catálogo.
- **Estado `planejada`** (§4.3). É o que faz o formulário parecer que serviu para alguma coisa.
- **"Copiar o texto da solicitação"** (§6.7). Dez linhas, e salva a mensagem quando o e-mail some.
- **Pré-selecionar a ferramenta por `?ferramenta=`** (§6.1). Permite pôr, dentro do gerador, um link
  "relatar problema" que chega aqui com o campo certo escolhido. É a integração mais barata entre os
  três projetos — e a que mais aumenta a chance de o defeito ser relatado, porque é relatado no
  momento em que acontece.
- **Preview do link** (§9.1). O hub existe para ser mandado por mensagem.

### 13.2 Vale, mas só se você mantiver

- **"O que mudou"** — um campo `novidades: { data, texto }[]` no catálogo e um selo "novidade" no
  card quando `atualizadaEm` for dos últimos 14 dias. É o principal motivo para alguém **voltar** ao
  hub em vez de ir direto pelo favorito. O risco é conhecido: changelog desatualizado é pior que
  changelog nenhum, porque passa a mentir. Só entra se for atualizado junto do deploy da ferramenta.
- **Link "como usar" por ferramenta**, apontando para o `README.md` do repositório. Barato, útil
  para quem chega sem contexto — e some sozinho do card quando o campo não existe.

### 13.3 Vale depois, quando forem muitas

- **Busca e filtro por tag** (§5.4), a partir de 7 ferramentas. Antes disso é mobília.
- **Agrupar por categoria** (documentos, treinamento, relatórios). A partir de ~10; o campo `tags`
  já está lá para isso.
- **Ordenar por mais usada.** Exigiria medir uso, que exigiria analytics (§3.3). Se um dia valer, a
  ordem manual do array é 90% do benefício por 0% do custo.

### 13.4 Não vale

- **Status de disponibilidade** ("no ar / fora do ar") em cada card. Parece bom e não funciona pelo
  navegador: checar outra origem sem CORS liberado devolve resposta opaca, obrigaria a abrir a CSP e
  daria falso "fora do ar" a torto e a direito. Dava para fazer no servidor, e aí é um cron, um
  cache e um estado — muito peso para dizer que dois sites estáticos da Vercel estão no ar. Quando
  caírem, você vai saber pelo formulário.
- **Contador de uso no card.** Mesma dependência de analytics, e com duas ferramentas o número é
  constrangedor de qualquer jeito.
- **Chat / assistente no hub.** Outro produto, outra conta, outra saída de dados.
- **Página por ferramenta, com capturas de tela.** Duplica documentação que já existe nos
  `INSTRUCOES.md` e envelhece mais rápido que o software. O card com três linhas e um clique é o que
  o hub precisa ser.

### 13.5 As ambiciosas — o que este projeto destrava

Vale entender o que muda com este repositório existir, porque é maior do que dois cards:

> **O hub é a primeira peça da família que tem servidor.** Os dois irmãos não têm, por decisão de
> privacidade, e é por isso que a lista de "fora de escopo" deles é grande: PDF, QR code de
> validação, numeração sequencial e histórico compartilhado foram todos recusados com a mesma
> frase — *"exigiria backend"*. Agora existe um backend. Ele é minúsculo e faz uma coisa só (§7),
> **e isso é de propósito** — mas o teto do que a família consegue fazer subiu, e as ideias abaixo
> passaram de impossíveis a caras.

Nenhuma delas é v1. Todas são grandes. Estão aqui na ordem em que eu as faria.

#### A. Validação de certificado por QR — a que mais muda o produto

Hoje um certificado emitido é um `.docx`: quem recebe não tem como provar que é legítimo, e quem
audita não tem como conferir. Com servidor, o gerador passa a escrever no documento um QR apontando
para `…/validar/ABC123`, e essa página responde uma coisa só:

```
✓ Certificado válido
  Treinamento: CIPA — 20h
  Emitido em: 11/08/2026 · Válido até: 11/08/2028
  Titular: M••••• J•••• D• S•••          ← nunca o nome inteiro, nunca o CPF
```

O que a torna viável sem quebrar a privacidade da família: **o servidor não guarda a pessoa, guarda
o certificado.** Um registro é `{ código, treinamento, data, validade, hashDoCPF }` — e o hash com
sal, que serve para confirmar quando alguém digita o CPF na página de validação, mas não permite
descobrir de quem é. Nome nunca vai inteiro. E o envio dos registros é uma ação explícita ao fim da
geração ("publicar a validação desta turma"), com a tela dizendo exatamente o que sobe — nunca
automática.

Custo honesto: um banco (Vercel Postgres ou KV), uma rota nova, e a decisão de guardar dado de
terceiro em servidor — que é uma conversa de LGPD de verdade, com base legal e prazo de retenção,
não uma decisão técnica. É a ideia mais valiosa e a mais séria da lista, nessa ordem.

#### B. Controle de validade dos treinamentos

A pergunta que ninguém consegue responder hoje: **quem precisa refazer o treinamento este mês?** As
NRs têm periodicidade, o gerador já sabe quem foi certificado e quando (o histórico de turmas), e
essa informação morre no IndexedDB de uma máquina só.

Uma ferramenta que lê o histórico exportado do gerador — sem servidor, no mesmo modelo dos irmãos —
e mostra o calendário de vencimentos, com filtro por treinamento e exportação em `.csv`, resolve
90% disso **sem** nenhuma das perguntas difíceis da ideia A. É a ferramenta nova mais óbvia da
família, e a que eu construiria primeiro.

A versão ambiciosa dela (com servidor, com aviso por e-mail 30 dias antes do vencimento) depende de
A já existir, porque as duas guardam a mesma coisa.

#### C. Cadastro compartilhado entre máquinas, sem entregar o cadastro

Hoje o cadastro de pessoas do gerador vive num navegador só, e passa de máquina para máquina por
arquivo exportado. Sincronizar pelo servidor seria conveniente e **quebraria a regra inteira** — a
não ser que o servidor não consiga ler o que guarda.

A forma defensável: o navegador cifra o cadastro com uma senha que a pessoa digita
(`SubtleCrypto`, chave derivada por PBKDF2), e o servidor guarda **um blob opaco**. Quem não tem a
senha não tem nada; o servidor, inclusive. É trabalhoso e tem a armadilha clássica — quem esquece a
senha perde o cadastro, e não existe "recuperar" — mas é a única versão que não desmente os três
`INSTRUCOES.md`.

Se isso parecer demais, a alternativa boba funciona: um botão no gerador que exporta o cadastro
direto para a pasta compartilhada da rede. Sem servidor, sem cifra, sem projeto novo.

#### D. Exportar em PDF, finalmente

Recusado nos dois irmãos por exigir backend. Com um servidor existindo, a conversão passa a caber:
LibreOffice numa função (ou num serviço pequeno), `.docx` entra, PDF sai.

**Mas repare no que atravessa a rede:** o certificado pronto, com nome e CPF, de trinta pessoas. É
exatamente o dado que os dois projetos existem para manter na máquina. Ou seja: tecnicamente
destravado, e ainda assim contra o princípio.

A saída honesta continua sendo a do §3.1 do visualizador — um serviço local em Docker que a pessoa
sobe na própria máquina. O servidor do hub não deve virar rota de documento com dado pessoal. Se um
dia virar, que seja com decisão escrita, prazo de retenção e apagamento imediato após a conversão.

#### E. Um pacote de interface comum aos três

Os três repositórios copiam os mesmos tokens, os mesmos componentes shadcn e o mesmo `keyboard.ts`.
Um pacote `@sae/ui` acabaria com a divergência — e cobra publicação, versionamento e um lugar para
hospedar.

**Veredicto: espere o quarto projeto.** Com três, copiar e colar custa menos que manter o pacote, e
o §9 já é a especificação compartilhada de fato. Com quatro, a conta vira.

#### F. Login corporativo

Só faz sentido **depois** de A ou C existirem, porque hoje não há nada para proteger. Quando houver,
é SSO da instituição, não usuário e senha do projeto — e aí ele entra pelo hub, que passa a ser
também a porta de autenticação da família.

### 13.6 Como decidir se uma ideia ambiciosa entra

Três perguntas, nesta ordem. A primeira que responder mal derruba a ideia:

1. **Ela obriga dado pessoal a sair da máquina de quem trabalha?** Se sim, ela precisa de uma
   resposta melhor que "é prático". As ideias A e C têm (hash e cifra no cliente); a D não tem.
2. **Quem mantém isso daqui a seis meses?** Servidor com banco não é código que se escreve e
   esquece: é migração, backup, custo e uma senha que vence. As duas ferramentas de hoje funcionam
   sozinhas há meses porque não têm nada disso.
3. **O que quebra se ninguém mexer por um ano?** Um site estático não quebra. Um QR de validação
   que para de responder invalida certificado que já está impresso e na parede de alguém — e esse é
   o tipo de dívida que não dá para abandonar depois de assumida.

---

## 14. Critérios de aceite

- [ ] A página abre mostrando as duas ferramentas, cada uma com nome, resumo, descrição e selo de
      privacidade.
- [ ] **O catálogo está no HTML da resposta** — com o JavaScript desligado, os dois cards aparecem e
      os links funcionam (`view-source` ou `curl` mostram os nomes).
- [ ] Clicar num card abre a ferramenta em nova aba, e o hub continua aberto.
- [ ] Ferramenta sem `url` **não é clicável** e não parece link quebrado.
- [ ] Acrescentar uma terceira ferramenta é editar `lib/ferramentas.ts` e nada mais.
- [ ] `…/#solicitar` abre a página já no formulário; `?ferramenta=gerador-certificados` chega com o
      campo preenchido.
- [ ] Trocar o tipo da solicitação muda o `placeholder` e **não apaga** o que já foi escrito.
- [ ] O bloco "o que vai junto com a sua mensagem" mostra exatamente o que é enviado (§6.4).
- [ ] Colar um CPF na descrição **impede** o envio, com a mensagem do §6.5, e o texto continua lá.
- [ ] Um envio válido chega em `otavioku@sae.com.br` com o assunto do §7.4, e **responder o e-mail
      responde para quem pediu**.
- [ ] O protocolo na tela é o mesmo do assunto do e-mail.
- [ ] Com o provedor derrubado de propósito, a tela mostra as três saídas do §6.8 e o texto não some.
- [ ] `RESEND_API_KEY` **não aparece** em nada que vá ao navegador (`grep -r "re_" .next/static/`).
- [ ] O endereço de destino **não aparece** no bundle (`grep -r "sae.com.br" .next/static/`).
- [ ] O honeypot preenchido devolve sucesso **sem** mandar e-mail.
- [ ] A CSP do §8 está ativa em produção e o console não tem nenhuma violação (é o teste do nonce,
      §8.1).
- [ ] Nenhuma requisição sai da aba enquanto se navega pelo catálogo — só ao enviar o formulário.
- [ ] O link colado numa conversa mostra título, descrição e imagem (§9.1).
- [ ] `pnpm build` passa com o TypeScript estrito, e `pnpm test` roda tudo do §11.
- [ ] O deploy é um `git push`: página e ação no mesmo projeto da Vercel, sem passo manual.

---

## 15. Ordem de construção

1. **Esqueleto**: `create-next-app` com TS e Tailwind, tokens do gerador colados no CSS, shadcn
   instalado. Cabeçalho e uma página vazia.
2. **`lib/ferramentas.ts` + `CardFerramenta` + a grade.** Aqui o hub já vale sozinho — as duas
   ferramentas a um clique.
3. **Publicar na Vercel.** Antes do formulário, de propósito: o endereço já existe, já dá para
   mandar para as pessoas, e o §16 se resolve enquanto o projeto é pequeno.
4. **`solicitacao.ts` + `dadoPessoal.ts` + `protocolo.ts` + `email.ts`, com os testes.** As peças
   puras antes de qualquer tela.
5. **O formulário**, com uma ação que só devolve o protocolo e não manda e-mail. Toda a interface do
   §6 — erro, confirmação, contexto — se prova aqui.
6. **O e-mail de verdade** (§7.2–7.4): Resend, domínio verificado, variáveis na Vercel.
7. **As defesas do §7.5, os cabeçalhos do §8 e o nonce do §8.1.**
8. **Preview do link, celular, teclado e polimento.**

Fazer o passo 3 antes do 5 garante que o hub exista mesmo se o formulário demorar: a parte que
resolve o problema de hoje são dois links numa página.

---

## 16. Deploy na Vercel

Um projeto só, do repositório do hub.

- **Preset**: Next.js, detectado sozinho. Sem `vercel.json` — os cabeçalhos são do `next.config.ts`
  (§8).
- **Variáveis de ambiente**: as três do §7.3, marcadas para *Production* e *Preview*. Mudança nelas
  exige **redeploy** para valer.
- **Preview por branch**: cada PR ganha um endereço, e a Server Action funciona lá sem configuração
  — a proteção de origem do Next usa o próprio host (§7.5).
- **Domínio**: assim que houver um, aponte para cá. O hub é o endereço que vai ser decorado e
  mandado por mensagem; as ferramentas podem continuar em `*.vercel.app`.

> **Confira o plano.** O plano gratuito da Vercel é para uso pessoal e não comercial; ferramenta
> interna de trabalho, a rigor, pede o plano pago. Vale confirmar os termos atuais antes de a coisa
> crescer — é o tipo de detalhe que ninguém lembra até virar problema, e a decisão é sua, não do
> código.
