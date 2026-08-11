# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual

O projeto ficou só com o catálogo e o cabeçalho. Não há formulário, ações de envio, testes do fluxo
de solicitação nem helpers associados.

Interface, comentários, nomes de teste e mensagens de erro em português do Brasil.

## O que o projeto é

Página única (`/`) que lista as ferramentas internas em cards. O hub aponta, não executa: não abre
documento, não gera nada, não embute ferramenta em iframe.

## Stack

Next.js App Router + TypeScript + Tailwind v4 (tokens em `@theme`) + shadcn/ui (`new-york`) +
lucide-react, na Vercel. pnpm, ESLint do `create-next-app`, Vitest + `@testing-library/react`.

Comandos: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`.

## Arquitetura

Quase tudo é Server Component. O catálogo tem que estar no HTML da resposta — com JS desligado os
cards aparecem e os links funcionam.

Toda a lógica mora em `lib/` como função pura, principalmente o catálogo, busca, teclado,
limites e utilidades de interface.

Catálogo = `lib/ferramentas.ts`, array tipado lido no build. Acrescentar ferramenta é editar esse
arquivo e nada mais. Três invariantes continuam: `id` nunca muda nem se reaproveita; `url` ausente
é o sinal de "ainda não existe"; `privacidade` é declaração, não enfeite.

## Regras que não se negociam sem reabrir a especificação

- **Nada de dado pessoal em tela nenhuma** do hub — nem CPF, nem nome de participante, nem
  documento.
- **Cabeçalhos em `next.config.ts` via `headers()`**, nunca `<meta>` — `frame-ancestors` é ignorada
  em `<meta>` (§8). CSP com _nonce_ por requisição em `middleware.ts` (§8.1); `'unsafe-inline'` em
  `script-src` anula a proteção. Sem CDN: fonte auto-hospedada por `next/font`.
- **Um único botão primário azul** na página do hub, quando existir ação de destaque. O cabeçalho
  não deve competir com o catálogo.
- **Tokens copiados do `src/index.css` do gerador** (`brand-*`, `cinza-*`, `sucesso`/`aviso`/`erro`).
  Hex solto não entra.

## Testes

Testar o catálogo, a filtragem e o comportamento de navegação que continua ativo.
