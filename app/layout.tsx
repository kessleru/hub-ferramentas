import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

/**
 * §3.2 — Inter por `next/font`: auto-hospedada, sem *layout shift* e sem CDN
 * (§8). O nome da variável é `--font-inter` e não `--font-sans` de propósito:
 * o `globals.css` é quem monta a pilha de fontes, num lugar só.
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

/**
 * §9.1 — o hub existe para ser colado em conversa, então o *preview* faz parte
 * do produto. Um link sem preview parece link suspeito, e é a primeira
 * impressão de quem nunca ouviu falar das ferramentas.
 */
/**
 * Sem isto o Next monta a URL do preview em cima de `localhost`. Na Vercel a
 * variável já existe no build; localmente o valor não importa, porque ninguém
 * cola link de `localhost` numa conversa.
 */
const enderecoDoSite = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(enderecoDoSite),
  title: 'Ferramentas',
  description:
    'Conjunto de ferramentas utilitárias internas, num endereço só. ' +
    'Gerador de certificados, visualizador de documentos e o formulário para pedir o que falta.',
  openGraph: {
    title: 'Ferramentas',
    description: 'Conjunto de ferramentas utilitárias internas, num endereço só.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  /**
   * §8.1 — **o preço do nonce, e ele é maior do que a especificação previa.**
   *
   * O nonce muda a cada requisição (`middleware.ts`), então o Next só consegue
   * carimbá-lo nos `<script>` que ele injeta se a página for renderizada por
   * requisição. Numa página estática o HTML fica em cache com um nonce velho —
   * ou, como acontecia aqui, sem nonce nenhum — e o `'strict-dynamic'` do §8
   * bloqueia o JavaScript inteiro em produção.
   *
   * Ler `headers()` é o que tira a página do estático. O que o §3.1 comprava
   * com o SSG continua de pé: o catálogo sai no HTML da resposta, antes de
   * qualquer JavaScript rodar (§14) — ele passou a ser montado por requisição
   * em vez de no build. O que se perde é o cache de borda da página.
   *
   * A alternativa era `'unsafe-inline'`, que o §8.1 recusa por anular a
   * proteção. Entre as duas, a especificação já escolheu: "Faça o nonce."
   */
  await headers()

  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
