import { Suspense } from 'react'

import { Cabecalho } from '@/components/Cabecalho'
import { FormularioSolicitacao } from '@/components/FormularioSolicitacao'
import { GradeFerramentas } from '@/components/GradeFerramentas'

/**
 * §5 — dois blocos empilhados abaixo do cabeçalho: catálogo e formulário.
 *
 * **Uma rota só.** O formulário é uma seção ancorada em `#solicitar`, não uma
 * página: o link `…/#solicitar` precisa ser mandável por mensagem, e uma
 * segunda rota separaria o pedido do catálogo que ele deveria estar olhando.
 *
 * Server Component. O catálogo vai no HTML da resposta (§14) — com o
 * JavaScript desligado, os cards aparecem e os links funcionam.
 *
 * O rodapé do §9 foi removido a pedido. A frase de confiança que ele carregava
 * ("só o formulário envia algo") vive hoje nos selos de privacidade de cada
 * card (§5.3) e no aviso acima do botão de enviar (§6.5).
 */
export default function Pagina() {
  return (
    <>
      <Cabecalho />

      <main className="mx-auto w-full max-w-280 flex-1 px-6 sm:px-8">
        <section aria-labelledby="titulo-catalogo" className="pt-10 pb-12">
          {/*
            §5.2 — o desenho da página não tem título acima dos cards: o
            cabeçalho já diz "Ferramentas" a dois centímetros dali, e repetir
            empurra o catálogo para baixo sem informar nada. O `h1` continua
            existindo para leitor de tela e para a estrutura do documento.
          */}
          <h1 id="titulo-catalogo" className="sr-only">
            Ferramentas
          </h1>

          <GradeFerramentas />
        </section>

        <hr className="border-cinza-200" />

        {/* §5 — a âncora é parte do produto: `…/#solicitar` tem que ser mandável
            por mensagem e cair já no formulário. */}
        <section
          id="solicitar"
          aria-labelledby="titulo-solicitar"
          className="scroll-mt-24 pt-12 pb-16"
        >
          <h2 id="titulo-solicitar" className="text-xl font-semibold text-cinza-900">
            Precisa de uma ferramenta que não está aqui?
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-cinza-500">
            Conte o que está faltando, ou avise de um defeito. Quem cuida das ferramentas lê tudo, e
            responde no e-mail que você deixar.
          </p>

          <div className="mt-6 max-w-2xl">
            {/*
              O formulário lê `?ferramenta=` (§6.1) com `useSearchParams`, e é
              isso que exige o `Suspense`.
            */}
            <Suspense
              fallback={<div className="h-96 rounded-[10px] border border-cinza-200 bg-white" />}
            >
              <FormularioSolicitacao />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  )
}
