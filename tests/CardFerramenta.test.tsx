import { Award } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CardFerramenta } from '@/components/CardFerramenta'
import { FERRAMENTAS, type Ferramenta } from '@/lib/ferramentas'

/** §11 — o que só teste de componente pega. */

const PLANEJADA: Ferramenta = {
  id: 'controle-validade',
  nome: 'Controle de validade',
  resumo: 'Quem precisa refazer o treinamento este mês',
  descricao: 'Lê o histórico exportado do gerador e mostra o calendário de vencimentos.',
  estado: 'planejada',
  icone: Award,
  tags: ['treinamento'],
  privacidade: 'local',
}

describe('CardFerramenta', () => {
  it('card `planejada` NÃO é link (§4.3)', () => {
    render(<CardFerramenta ferramenta={PLANEJADA} />)

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Controle de validade')).toBeInTheDocument()
    expect(screen.getByText('planejada')).toBeInTheDocument()
  })

  it('todo card externo abre em nova aba e tem `rel` com noopener (§5.3)', () => {
    for (const ferramenta of FERRAMENTAS.filter((f) => f.url)) {
      const { unmount } = render(<CardFerramenta ferramenta={ferramenta} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', ferramenta.url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link.getAttribute('aria-label')).toContain('(abre em nova aba)')

      unmount()
    }
  })

  it('mostra o selo de privacidade com texto, não só com cor (§9)', () => {
    render(<CardFerramenta ferramenta={FERRAMENTAS[0]} />)
    expect(screen.getByText('Fica no seu navegador')).toBeInTheDocument()
  })

  it('não põe selo de estado numa ferramenta ativa (§4.3)', () => {
    render(<CardFerramenta ferramenta={FERRAMENTAS[0]} />)
    expect(screen.queryByText(/em teste|em construção|planejada/)).toBeNull()
  })
})
