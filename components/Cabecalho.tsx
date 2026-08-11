import Image from 'next/image'

import { Button } from '@/components/ui/button'

/**
 * §5.1 — o cabeçalho: marca, divisor, título e linha de apoio à esquerda; um
 * botão à direita que rola até o formulário.
 *
 * Server Component: não tem estado nem evento. O "rolar até" é a âncora
 * `#solicitar` do navegador, não JavaScript — funciona antes de o JS carregar e
 * continua funcionando se ele falhar.
 */
export function Cabecalho() {
  /**
   * §5.1 pedia 56px. Na tela de verdade ficou espremido: com marca de 28px e
   * duas linhas de texto, 56px não sobra respiro em cima nem embaixo. Aqui são
   * 96px, marca de 32px e mais ar entre as peças.
   *
   * O §9 abre essa porta explicitamente — "onde o hub pode se soltar": os
   * irmãos são bancadas de trabalho onde a interface some; este é uma porta de
   * entrada, vista uma vez por semana por trinta segundos, e pode ter mais ar.
   */
  return (
    <header className="sticky p-2 top-0 z-10 h-24 border-b border-cinza-200 bg-white/90 backdrop-blur-sm">
      {/* §5.2 — largura máxima de 1120px, a mesma do catálogo abaixo. */}
      <div className="mx-auto flex h-full max-w-280 items-center gap-5 px-6 sm:px-8">
        <Image src="/marca.svg" alt="" width={32} height={32} priority className="size-8" />

        <div aria-hidden className="h-9 w-px bg-cinza-200" />

        <div className="min-w-0">
          <p className="truncate text-base font-medium leading-snug text-cinza-900">Ferramentas</p>
          {/* §5.1 — a linha de apoio. Some no celular: em 360px ela empurra o
              botão para fora antes de informar qualquer coisa. */}
          <p className="mt-0.5 hidden truncate text-[13px] leading-snug text-cinza-500 sm:block">
            Conjunto de ferramentas utilitárias internas
          </p>
        </div>

        {/* §5.1 — `outline`, não azul: o único primário da página é o "Enviar
            solicitação" (§9), e o herói desta tela é o catálogo. */}
        <Button asChild variant="outline" size="lg" className="ml-auto shrink-0">
          <a href="#solicitar">Pedir ou relatar</a>
        </Button>
      </div>
    </header>
  )
}
