import { CardFerramenta } from '@/components/CardFerramenta'
import { GradeComBusca } from '@/components/GradeComBusca'
import { FERRAMENTAS, ferramentasAtivas, type Ferramenta } from '@/lib/ferramentas'
import { MOSTRAR_BUSCA_A_PARTIR_DE } from '@/lib/limites'

/**
 * §5.2 — a grade do catálogo.
 *
 * `minmax(280px, 1fr)` com **no máximo 3 colunas** mesmo em tela larga: com
 * duas ferramentas, quatro colunas deixam dois cards espremidos num canto e
 * três metros de vazio. Abaixo de 720px, uma coluna.
 */
export const CLASSES_DA_GRADE =
  'grid grid-cols-1 gap-5 min-[720px]:grid-cols-2 min-[1024px]:grid-cols-3'

export function GradeFerramentas({
  ferramentas = FERRAMENTAS,
}: {
  ferramentas?: Ferramenta[]
}) {
  /**
   * §5.4 — a busca só existe a partir de `MOSTRAR_BUSCA_A_PARTIR_DE`
   * ferramentas ativas, e **é a partir daí que a grade vira Client Component —
   * e só ela.** Enquanto forem duas, isto aqui é HTML puro: nenhum JavaScript
   * do catálogo chega ao navegador.
   */
  if (ferramentasAtivas(ferramentas).length >= MOSTRAR_BUSCA_A_PARTIR_DE) {
    return <GradeComBusca ferramentas={ferramentas} />
  }

  return (
    <ul className={CLASSES_DA_GRADE}>
      {ferramentas.map((ferramenta) => (
        <li key={ferramenta.id} className="flex">
          <CardFerramenta ferramenta={ferramenta} />
        </li>
      ))}
    </ul>
  )
}
