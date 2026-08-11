# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual

O repositório ainda **não tem código** — só `INSTRUCOES.md`. O projeto está no passo 1 do §15
(esqueleto ainda não criado). Nada abaixo descreve código existente; descreve o que a especificação
manda construir.

## `INSTRUCOES.md` é normativo

`INSTRUCOES.md` (pt-BR, 1023 linhas) é a fonte da verdade deste projeto — não é um README, é a
especificação. Antes de implementar qualquer coisa, leia a seção correspondente. O código deve
**citar as seções nos comentários** (`§4.1`, `§7.2`…), como já se faz nos projetos irmãos.

Cada decisão lá vem com o porquê ao lado, e **é o porquê que decide se ela pode ser revista**. Se
uma escolha parecer errada, o caminho é discutir o motivo escrito, não trocar em silêncio.

Interface, comentários, nomes de teste e mensagens de erro em **português do Brasil**.

## O que o projeto é

Página única (`/`) que lista as ferramentas internas em cards e traz um formulário para pedir
ferramenta nova ou relatar defeito. O hub **aponta, não executa** — não abre documento, não gera
nada, não embute ferramenta em iframe.

Irmãos (repositórios separados, mesma família): gerador-certificados e visualizador-documentos.
Ambos são SPAs Vite offline-first com `connect-src 'none'`. **Este projeto não herda essa stack** —
herda só a cara (§9). Ver §2.1 para o que herda e o que não.

## Stack pretendida (§3)

Next.js App Router + TypeScript + Tailwind v4 (tokens em `@theme`) + shadcn/ui (`new-york`) + zod +
lucide-react + Resend, na Vercel. **pnpm**, ESLint do `create-next-app`, Vitest +
`@testing-library/react`.

Comandos, uma vez que o esqueleto exista: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`,
`pnpm test <arquivo>` para um teste só.

Não entram: biblioteca de formulário, banco, ORM, autenticação, analytics/pixel, service
worker/PWA, iframe das ferramentas, CMS como fonte do catálogo (§3.3, §12).

## Arquitetura — as ideias que atravessam vários arquivos

**Quase tudo é Server Component.** `'use client'` só no formulário e, um dia, na grade quando a
busca existir (§5.4). O catálogo tem que estar no HTML da resposta — com JS desligado os cards
aparecem e os links funcionam. Pôr `'use client'` num card merece pergunta antes (§5.3).

**Toda a lógica mora em `lib/` como função pura**, para que os testes não precisem montar tela:
`ferramentas.ts` (o catálogo), `solicitacao.ts` (schema zod), `dadoPessoal.ts` (heurística de CPF),
`protocolo.ts`, `email.ts`, `busca.ts`, `contexto.ts`, `limites.ts`. Estrutura completa no §10.

**Catálogo = `lib/ferramentas.ts`**, array tipado lido no build (§4). Acrescentar ferramenta é
editar esse arquivo e nada mais. Três invariantes: `id` nunca muda nem se reaproveita (vai na URL e
no e-mail já enviado); `url` **ausente** — nunca `'#'` nem `''` — é o sinal de "ainda não existe" e
faz o card virar bloco inerte, sem `<a>` e sem `aria-disabled` (§4.3); `privacidade` é declaração,
não enfeite.

**Um schema zod só** (`lib/solicitacao.ts`), importado pelo formulário **e** pela Server Action
(§6.6). Dois schemas é aceitar no cliente o que o servidor recusa.

**Um servidor, uma ação.** `app/acoes/solicitar.ts` com `'use server'` manda o e-mail e mais nada —
sem banco, sem sessão, sem log do conteúdo (§7.2). A ação é a **fronteira de confiança**: é um
endpoint público com outro nome, então revalida tudo. A resposta nunca ecoa o que chegou (só o
protocolo ou o campo inválido), e erro do provedor vai para `console.error`, nunca para a tela.

**O formulário funciona sem JavaScript.** `<form action={acaoDoServidor}>` + `useActionState`. Não
introduza `onSubmit={e => e.preventDefault()}` para "melhorar" o envio.

## Regras que não se negociam sem reabrir a especificação

- **Nada de anexo no formulário** (§6.3). Um print da tela do gerador tem a turma inteira com CPF.
- **Nada de dado pessoal em tela nenhuma** do hub — nem CPF, nem nome de participante, nem
  documento.
- **Nada de `NEXT_PUBLIC_`** em `RESEND_API_KEY`, `EMAIL_DESTINO` ou `EMAIL_REMETENTE` — o Next
  embute no bundle tudo com esse prefixo (§7.3). O endereço de destino fica fora do bundle; o
  `mailto:` de emergência do §6.8 busca ele por Server Action.
- **CPF é checado duas vezes**: no navegador para explicar bem (§6.5) e no servidor porque é a
  checagem que vale (§7.6). O texto da pessoa **nunca** é descartado — nem ao bloquear, nem ao
  falhar o envio (§6.8).
- **Cabeçalhos em `next.config.ts` via `headers()`**, nunca `<meta>` — `frame-ancestors` é ignorada
  em `<meta>` (§8). CSP com *nonce* por requisição em `middleware.ts` (§8.1); `'unsafe-inline'` em
  `script-src` anula a proteção. Sem CDN: fonte auto-hospedada por `next/font`.
- **Defesas antirrobô sem estado** (§7.5): honeypot `site` escondido por CSS e tempo mínimo de 3s —
  os dois devolvem **sucesso com protocolo falso**, sem enviar. Devolver erro ensina o robô.
- **Um único botão primário azul** na página: "Enviar solicitação". O do cabeçalho é `outline`, o
  card é link. Se houver dois azuis, um está errado (§9).
- **Tokens copiados do `src/index.css` do gerador** (`brand-*`, `cinza-*`, `sucesso`/`aviso`/`erro`).
  Hex solto não entra.

## Testes (§11)

Testar a lógica pura de `lib/` direto, e a ação chamando `enviarSolicitacao` com `FormData` montado
à mão e o SDK do Resend substituído por espião — honeypot tem que dar sucesso **sem chamar o envio**.
O caso mais provável de defeito em `dadoPessoal.ts` é falso positivo: telefone, CEP, número de
processo e data **não** podem bloquear. Testes de componente cobrem o que só a tela pega (trocar o
tipo não apaga a descrição, `planejada` não é link, `rel` com `noopener`, `?ferramenta=` chega no
select).

Antes de dar algo por pronto, confira a lista do §14 — ela é executável (inclui
`grep -r "re_" .next/static/` e `grep -r "sae.com.br" .next/static/`).

## Ordem de construção (§15)

Publicar na Vercel **antes** do formulário, de propósito: a parte que resolve o problema de hoje são
dois links numa página, e ela não deve esperar o resto.
