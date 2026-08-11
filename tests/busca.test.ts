import { describe, expect, it } from 'vitest'

import { filtrar, normalizar } from '@/lib/busca'
import { FERRAMENTAS } from '@/lib/ferramentas'

const ids = (lista: typeof FERRAMENTAS) => lista.map((f) => f.id)

describe('normalizar', () => {
  it('tira acento e caixa', () => {
    expect(normalizar('  Integração  ')).toBe('integracao')
    expect(normalizar('CONFERÊNCIA')).toBe('conferencia')
  })
})

describe('filtrar', () => {
  it('acha por termo exato', () => {
    expect(ids(filtrar(FERRAMENTAS, 'certificado'))).toEqual(['gerador-certificados'])
  })

  it('acha em caixa alta', () => {
    expect(ids(filtrar(FERRAMENTAS, 'CERTIFICADO'))).toEqual(['gerador-certificados'])
  })

  it('acha no plural, porque casa no nome', () => {
    expect(ids(filtrar(FERRAMENTAS, 'certificados'))).toEqual(['gerador-certificados'])
  })

  it('acha sem acento', () => {
    expect(ids(filtrar(FERRAMENTAS, 'conferencia'))).toEqual(['visualizador-documentos'])
  })

  it('busca vazia devolve tudo', () => {
    expect(filtrar(FERRAMENTAS, '')).toHaveLength(FERRAMENTAS.length)
    expect(filtrar(FERRAMENTAS, '   ')).toHaveLength(FERRAMENTAS.length)
  })

  it('não casa na descrição — texto longo devolveria tudo', () => {
    // "concordância" e "índice" só aparecem na `descricao`. Já "Word" aparece
    // no `resumo` do gerador, e por isso casa — é o comportamento certo.
    expect(filtrar(FERRAMENTAS, 'concordancia')).toHaveLength(0)
    expect(filtrar(FERRAMENTAS, 'indice')).toHaveLength(0)
    expect(ids(filtrar(FERRAMENTAS, 'word'))).toEqual(['gerador-certificados'])
  })

  it('com várias palavras, todas precisam casar', () => {
    expect(ids(filtrar(FERRAMENTAS, 'docx turma'))).toEqual(['gerador-certificados'])
    expect(filtrar(FERRAMENTAS, 'docx inexistente')).toHaveLength(0)
  })

  it('devolve vazio quando não acha, para a tela poder oferecer o formulário', () => {
    expect(filtrar(FERRAMENTAS, 'xyz')).toHaveLength(0)
  })
})
