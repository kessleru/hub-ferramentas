# Padrão de favicon da família

> Copie este arquivo para a raiz de cada repositório da família. Ele é
> **normativo**: o favicon de cada projeto sai daqui, e não de escolha caso a
> caso. Como no resto da família, cada decisão vem com o porquê ao lado — e é o
> porquê que decide se ela pode ser revista.

## 1. O que este documento resolve

Os projetos da família são vistos juntos: quem usa o gerador tem o visualizador
numa aba ao lado e o hub numa terceira. Hoje cada um herdou o ícone que veio do
template (`vite.svg`, `favicon.ico` do `create-next-app`), o que produz o pior
resultado possível — **três abas idênticas ou três abas sem relação nenhuma**, e
em ambos os casos a pessoa erra a aba.

O objetivo não é "ter um ícone bonito". É que, numa fileira de abas com 16
pixels cada, dê para **saber qual é qual sem ler o título**, e ao mesmo tempo
**reconhecer que são da mesma casa**.

Isso decide o formato: moldura idêntica em todos, glifo diferente em cada um.

## 2. O sistema

| Peça | Regra | Por quê |
|---|---|---|
| Moldura | quadrado 32×32, `rx="8"` | igual em todos os projetos: é ela que faz os três parecerem família |
| Fundo | **sólido**, `brand-700` | ícone de fundo transparente some no tema escuro do navegador. Fundo sólido funciona nos dois temas sem um segundo arquivo |
| Glifo | branco puro, sólido | contraste máximo é o que sobrevive a 16px |
| Traço | mínimo 2.6 em 32×32 | abaixo disso o traço vira meio pixel e some |
| Vão entre formas | mínimo 2 em 32×32 | é o que impede duas formas de virarem um borrão |
| Formato do arquivo | **SVG** | um arquivo, todos os tamanhos, e dá para revisar no `git diff` |

**Nada de gradiente, sombra, texto ou traço fino.** Os três morrem em 16px, e
16px é o tamanho em que o ícone é realmente usado — o resto é vaidade de tela
grande.

> **A cor.** Use o valor de `--brand-700` do `index.css` do próprio projeto, e
> não o hex abaixo. Os SVGs desta página estão com `#1d4ed8`, que é o que o hub
> usa hoje; se o `brand-700` da família for outro, troque nos dois lugares de
> cada arquivo (`fill` da moldura e recortes internos).

## 3. Os arquivos

> **Já estão prontos.** A pasta `padrao-favicon/` do repositório do hub tem uma
> subpasta por projeto, cada uma com o `icon.svg` e o PNG do §5 já gerado. Copie
> a subpasta do seu projeto e siga o §4 — o SVG abaixo é o mesmo arquivo, aqui
> para você poder ler o desenho sem abrir nada.

Os três glifos abaixo foram desenhados em 32×32 e **conferidos renderizados em
16px** — as versões "óbvias" (medalha com fita, selo com estrela, folha única)
foram testadas antes e viram borrão nesse tamanho. Se for redesenhar, refaça o
teste do §6 antes de trocar.

### 3.1 Hub de ferramentas

Um nó central ligado a três — a página aponta para as ferramentas, e é
literalmente o que o hub faz.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#1d4ed8" />
  <g stroke="#ffffff" stroke-width="2.8" stroke-linecap="round">
    <line x1="16" y1="16" x2="16" y2="8.5" />
    <line x1="16" y1="16" x2="22.6" y2="20" />
    <line x1="16" y1="16" x2="9.4" y2="20" />
  </g>
  <circle cx="16" cy="16" r="4.2" fill="#ffffff" />
  <circle cx="16" cy="7.6" r="3.3" fill="#ffffff" />
  <circle cx="23.3" cy="20.4" r="3.3" fill="#ffffff" />
  <circle cx="8.7" cy="20.4" r="3.3" fill="#ffffff" />
</svg>
```

### 3.2 Gerador de Certificados

Uma folha com selo no canto. O selo é um disco recortado em `brand-700`, e é ele
que separa este ícone do próximo numa fileira de abas.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#1d4ed8" />
  <rect x="7" y="5.5" width="14" height="19" rx="3" fill="#ffffff" />
  <circle cx="22" cy="22" r="5.4" fill="#1d4ed8" />
  <circle cx="22" cy="22" r="3.6" fill="#ffffff" />
</svg>
```

O disco de fora é da cor da moldura de propósito: ele **abre um vão** entre a
folha e o selo. Sem esse vão as duas formas encostam e viram uma mancha só.

### 3.3 Visualizador de Documentos

Duas folhas empilhadas e deslocadas — "vários `.docx` de uma vez", que é a frase
do próprio projeto.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="8" fill="#1d4ed8" />
  <rect x="14" y="5" width="12" height="17" rx="2.8" fill="#ffffff" opacity="0.5" />
  <rect x="6" y="10" width="12" height="17" rx="2.8" fill="#ffffff" />
</svg>
```

A folha de trás usa `opacity="0.5"` em vez de um azul claro fixo: assim ela
acompanha a cor da moldura sozinha se o `brand-700` mudar.

## 4. Onde cada arquivo vai

### 4.1 Projeto Next.js (App Router) — o hub

```
app/
  icon.svg          ← o SVG do §3, sem mais nada
  apple-icon.png    ← 180×180, gerado no §5
```

O App Router encontra os dois pelo nome e injeta as tags sozinho. **Não escreva
`<link rel="icon">` no `layout.tsx`** — daria duas declarações concorrentes.

Apague o `app/favicon.ico` que veio do `create-next-app`: se ele ficar, ganha do
`icon.svg` em parte dos navegadores e o padrão não vale para nada.

### 4.2 Projeto Vite + React — o gerador e o visualizador

```
public/
  icon.svg
  apple-touch-icon.png
```

E no `index.html`, dentro do `<head>`:

```html
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

Apague o `public/vite.svg` e a linha `<link rel="icon" href="/vite.svg" />` que
veio do template.

> **A CSP dos irmãos não atrapalha.** Os dois arquivos são servidos da própria
> origem, e `img-src 'self'` já cobre. Nenhuma mudança de cabeçalho é
> necessária, e é justamente por isso que o ícone não pode vir de CDN.

## 5. O `apple-touch-icon`

É o único PNG do conjunto, e existe porque o iOS não aceita SVG quando alguém
põe a página na tela de início.

**Ele é uma variante quadrada, sem `rx`.** O iOS aplica a própria máscara
arredondada por cima; se o arquivo já vier com cantos redondos, a máscara corta
de novo e o resultado é um ícone com borda serrilhada.

Ou seja: tire o `rx="8"` do `<rect>` da moldura, salve como `icon-quadrado.svg`,
gere o PNG e **jogue o SVG quadrado fora** — ele é intermediário, não entra no
repositório.

```bash
pnpm dlx sharp-cli -i icon-quadrado.svg -o apple-touch-icon.png resize 180 180
```

(Comando conferido. Qualquer outro conversor serve — o que importa é 180×180 e
fundo opaco.)

O PNG é gerado **uma vez e commitado**. Não vale acrescentar um passo de build
para produzir um arquivo que muda de ano em ano.

### E o `favicon.ico`?

Fora do padrão, de propósito. Ele só serve para navegadores que não entendem SVG
— e nenhum deles abre as ferramentas da família, que dependem de recursos muito
mais recentes que isso. Um `.ico` a mais é um arquivo binário que ninguém revisa
e que sai de sincronia com o SVG na primeira mudança.

## 6. Como conferir

Antes de dar por pronto, os três testes que pegam o que os olhos não pegam em
tela grande:

1. **16px, que é o tamanho de verdade.** Renderize e olhe ampliado:

   ```bash
   pnpm dlx sharp-cli -i icon.svg -o t16.png resize 16 16
   pnpm dlx sharp-cli -i t16.png -o t16-zoom.png resize 112 112 --kernel nearest
   ```

   Se o glifo virar uma mancha, é o glifo que está errado — não o teste.

2. **Lado a lado com os irmãos.** Abra os três `t16-zoom.png` juntos. Se você
   precisar pensar para dizer qual é qual, o conjunto falhou.

3. **Tema claro e tema escuro.** Troque o tema do sistema e olhe a barra de
   abas. O fundo sólido do §2 é o que faz os dois funcionarem; se você mexeu
   nisso, é aqui que aparece.

Depois, no navegador: `Ctrl+Shift+R` na página. Favicon é o recurso mais
agressivamente cacheado que existe, e mais de uma pessoa já "consertou" um
favicon que só estava em cache.

## 7. O ícone do card, no hub

O hub mostra um ícone do `lucide-react` em cada card (`lib/ferramentas.ts`), e
ele **tem que combinar com o favicon daquela ferramenta**. O card e a aba são a
mesma coisa vista em dois lugares; se forem desenhos diferentes, o hub deixa de
ajudar exatamente quem ele existe para ajudar — quem ainda não sabe qual aba é
qual.

Hoje o par está assim:

| Ferramenta | Favicon | Ícone do card |
|---|---|---|
| Gerador de Certificados | folha com selo | `FileBadge` |
| Visualizador de Documentos | folhas empilhadas | `Files` |

Ao acrescentar uma ferramenta, escolha os dois na mesma hora. Se o lucide não
tiver nada parecido com o glifo que você desenhou, é sinal de que o glifo está
complicado demais — volte ao §8.

## 8. O glifo do próximo projeto

Quando entrar a quarta ferramenta, o ícone dela sai destas regras:

1. **Uma ideia, não duas.** "Documento com selo" já é o limite; "documento com
   selo e relógio" não sobrevive a 16px.
2. **Duas formas sólidas, no máximo três.** E cada uma com pelo menos 2 unidades
   de vão para a vizinha.
3. **Que o glifo diga o que a ferramenta faz**, não o nome dela. Letra inicial
   está fora: com quatro projetos as iniciais começam a repetir, e uma letra num
   quadrado azul não diz nada a quem nunca abriu a ferramenta.
4. **Compare com os três que já existem** antes de fechar. O critério é o teste
   2 do §6.

## 9. Estado atual

Os SVGs do §3 são **provisórios**: eles usam a paleta da família, mas não a
marca da instituição, que ainda não existe em arquivo. Quando ela chegar, a
moldura do §2 continua valendo e é ela que passa a hospedar a marca — o que
muda é o glifo, num arquivo por projeto.

No hub, o mesmo desenho aparece em dois lugares e os dois trocam juntos:
`app/icon.svg` (a aba) e `public/marca.svg` (o cabeçalho, §5.1 do `INSTRUCOES.md`).
