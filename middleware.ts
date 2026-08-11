import { NextResponse, type NextRequest } from 'next/server'

/**
 * §8.1 — o *nonce*, que é o preço do Next.
 *
 * O App Router injeta `<script>` inline (é assim que o RSC entrega o conteúdo),
 * então `script-src 'self'` sozinho **quebra a página**. As saídas eram
 * `'unsafe-inline'` — que anula a proteção — ou um nonce gerado por
 * requisição. É esta a receita, e ela é a única parte do projeto que existe só
 * por causa da escolha de framework (§3.1).
 *
 * Se um dia isto virar dor, a rota de fuga é o Astro, e ela custa reescrever as
 * telas — não a lógica (§10).
 */
export function middleware(requisicao: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  /**
   * §8 — a diferença para os irmãos são duas linhas, e as duas são consequência
   * do §2.1:
   *
   * - `connect-src 'self'` no lugar de `'none'`: o app fala com o próprio
   *   servidor e com mais ninguém.
   * - `form-action 'self'` no lugar de `'none'`: o envio é um `<form>` de
   *   verdade (§7.2), então fechá-lo quebraria o formulário. `'self'` continua
   *   impedindo POST para fora.
   */
  const csp = [
    "default-src 'self'",
    // §8.1 — em desenvolvimento o Next precisa de `eval` para o hot reload.
    // Em produção a diretiva sai, e é a de produção que o §14 manda conferir.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''
    }`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'none'",
  ].join('; ')

  // O Next lê `x-nonce` da requisição e carimba o atributo em cada <script> que
  // ele mesmo injeta.
  const cabecalhos = new Headers(requisicao.headers)
  cabecalhos.set('x-nonce', nonce)
  cabecalhos.set('Content-Security-Policy', csp)

  const resposta = NextResponse.next({ request: { headers: cabecalhos } })
  resposta.headers.set('Content-Security-Policy', csp)

  return resposta
}

export const config = {
  matcher: [
    /**
     * Tudo menos o que já sai com cabeçalho próprio e não executa script:
     * arquivos estáticos, imagens otimizadas, o ícone e o preview do §9.1.
     * Rodar o middleware neles seria gerar nonce para quem não usa nonce.
     */
    {
      source: '/((?!_next/static|_next/image|icon.svg|opengraph-image).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
