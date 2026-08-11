import type { NextConfig } from 'next'

/**
 * §8 — os cabeçalhos vão aqui, em `headers()`: **cabeçalho de verdade, não
 * `<meta>`**. É uma melhoria em relação aos irmãos, e a diferença é concreta:
 * `frame-ancestors` é *ignorada* quando vem por `<meta>`; nos dois irmãos ela
 * está lá por herança e não faz nada.
 *
 * A CSP **não** está aqui: ela carrega um *nonce* por requisição (§8.1), e
 * `headers()` é estático. Quem a monta é o `middleware.ts`. Estes dois abaixo
 * não dependem da requisição, então ficam onde o §8 mandou.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:caminho*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          /**
           * Sem isto, cada clique num card manda o endereço do hub como
           * referência para o site da ferramenta.
           */
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}

export default nextConfig
