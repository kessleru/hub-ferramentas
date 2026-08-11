import { describe, expect, it } from 'vitest'

import { ehClicavel, FERRAMENTAS } from '@/lib/ferramentas'

/**
 * §11 — "parece bobo até alguém acrescentar a décima ferramenta às pressas".
 * Este arquivo é o que faz o §4 continuar valendo depois do décimo commit.
 */
describe('o catálogo', () => {
  it('tem `id` único', () => {
    const ids = FERRAMENTAS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tem `id` estável, sem espaço nem maiúscula — ele entra na URL e no e-mail', () => {
    for (const ferramenta of FERRAMENTAS) {
      expect(ferramenta.id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('toda ferramenta ativa ou beta tem `url`', () => {
    for (const ferramenta of FERRAMENTAS) {
      if (ferramenta.estado === 'ativa' || ferramenta.estado === 'beta') {
        expect(ehClicavel(ferramenta)).toBe(true)
      }
    }
  })

  it('nenhuma planejada tem `url`', () => {
    for (const ferramenta of FERRAMENTAS) {
      if (ferramenta.estado === 'planejada') {
        expect(ferramenta.url).toBeUndefined()
      }
    }
  })

  it('não usa `#` nem string vazia como "ainda não existe" (§4.1)', () => {
    for (const ferramenta of FERRAMENTAS) {
      expect(ferramenta.url).not.toBe('#')
      expect(ferramenta.url).not.toBe('')
    }
  })

  it('usa um ícone por ferramenta, nunca repetido', () => {
    const icones = FERRAMENTAS.map((f) => f.icone)
    expect(new Set(icones).size).toBe(icones.length)
  })

  it('tem resumo de uma linha, sem ponto final', () => {
    for (const ferramenta of FERRAMENTAS) {
      expect(ferramenta.resumo).not.toMatch(/\.$/)
      expect(ferramenta.resumo).not.toContain('\n')
    }
  })

  it('declara privacidade em toda ferramenta — é o selo do card (§5.3)', () => {
    for (const ferramenta of FERRAMENTAS) {
      expect(['local', 'servidor']).toContain(ferramenta.privacidade)
    }
  })
})
