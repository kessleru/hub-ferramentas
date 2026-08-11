import { describe, expect, it } from 'vitest'

import { FORMATO_DO_PROTOCOLO, gerarProtocolo } from '@/lib/protocolo'

describe('gerarProtocolo', () => {
  it('sai no formato SOL-AAAA-MMDD-XXXX', () => {
    expect(gerarProtocolo(new Date(2026, 7, 11))).toMatch(FORMATO_DO_PROTOCOLO)
  })

  it('usa a data recebida', () => {
    expect(gerarProtocolo(new Date(2026, 7, 11))).toMatch(/^SOL-2026-0811-/)
    // Mês e dia de um dígito saem com zero à esquerda.
    expect(gerarProtocolo(new Date(2026, 0, 5))).toMatch(/^SOL-2026-0105-/)
  })

  it('dois seguidos não saem iguais', () => {
    const quando = new Date(2026, 7, 11)
    expect(gerarProtocolo(quando)).not.toBe(gerarProtocolo(quando))
  })

  it('não usa caracteres que se confundem ao ler em voz alta', () => {
    const quando = new Date(2026, 7, 11)
    for (let i = 0; i < 200; i++) {
      const sorteio = gerarProtocolo(quando).split('-')[3]
      expect(sorteio).not.toMatch(/[01OI]/)
    }
  })
})
