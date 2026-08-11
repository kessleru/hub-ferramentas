'use client'

import { ROTULO_DO_CONTEXTO } from '@/lib/contexto'
import type { Contexto } from '@/lib/solicitacao'

/**
 * §6.4 — "o que vai junto com a sua mensagem".
 *
 * **Isto fica visível.** Mandar dado do navegador de alguém sem dizer que está
 * mandando é o tipo de coisa que, descoberta depois, custa a confiança que a
 * família passou três projetos construindo.
 *
 * `<details>` nativo: recolhe e abre sem JavaScript, e o que ele mostra é
 * exatamente o objeto que vai no `<input type="hidden">` abaixo — não uma
 * descrição do objeto.
 */
export function ContextoEnviado({ contexto }: { contexto: Contexto | null }) {
  return (
    <details className="rounded-lg border border-cinza-200 bg-cinza-50 px-3 py-2">
      <summary className="cursor-pointer text-xs text-cinza-500 marker:text-cinza-400">
        O que vai junto com a sua mensagem
      </summary>

      {contexto ? (
        <dl className="mt-2 space-y-1 text-xs text-cinza-500">
          {(Object.keys(ROTULO_DO_CONTEXTO) as (keyof Contexto)[]).map((chave) => (
            <div key={chave} className="flex gap-2">
              <dt className="shrink-0 font-medium text-cinza-600">{ROTULO_DO_CONTEXTO[chave]}:</dt>
              <dd className="min-w-0 break-words">{contexto[chave]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-xs text-cinza-500">
          Nada além do que você escreveu — o navegador não deixou montar o contexto.
        </p>
      )}

      <p className="mt-2 text-xs text-cinza-500">
        Nada de identificador permanente, e a mensagem não é guardada em banco nenhum.
      </p>
    </details>
  )
}
