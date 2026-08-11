import { describe, expect, it } from 'vitest'

import { lerFormData, solicitacaoSchema } from '@/lib/solicitacao'

const BOM = {
  tipo: 'defeito',
  ferramentaId: 'gerador-certificados',
  assunto: 'Não gera quando o nome tem acento',
  descricao: 'Subi o modelo, colei a lista e cliquei em gerar. Não baixou nada e a tela travou.',
  nome: 'Maria Silva',
  email: 'maria@exemplo.com.br',
}

describe('solicitacaoSchema', () => {
  it('aceita o caso bom', () => {
    expect(solicitacaoSchema.safeParse(BOM).success).toBe(true)
  })

  it('aceita sem contexto — é assim que o envio sem JavaScript chega (§7.2)', () => {
    expect(solicitacaoSchema.safeParse({ ...BOM, contexto: undefined }).success).toBe(true)
  })

  it('recusa assunto curto', () => {
    const saida = solicitacaoSchema.safeParse({ ...BOM, assunto: 'oi' })
    expect(saida.success).toBe(false)
    expect(saida.error?.issues[0].path).toEqual(['assunto'])
  })

  it('recusa descrição curta', () => {
    const saida = solicitacaoSchema.safeParse({ ...BOM, descricao: 'não funciona' })
    expect(saida.success).toBe(false)
    expect(saida.error?.issues[0].path).toEqual(['descricao'])
  })

  it('recusa e-mail inválido', () => {
    const saida = solicitacaoSchema.safeParse({ ...BOM, email: 'maria arroba exemplo' })
    expect(saida.success).toBe(false)
    expect(saida.error?.issues[0].path).toEqual(['email'])
  })

  it('recusa descrição de 5000 caracteres — é o que impede 4 MB de texto (§7.5)', () => {
    const saida = solicitacaoSchema.safeParse({ ...BOM, descricao: 'a'.repeat(5000) })
    expect(saida.success).toBe(false)
    expect(saida.error?.issues[0].path).toEqual(['descricao'])
  })

  it('recusa honeypot preenchido', () => {
    const saida = solicitacaoSchema.safeParse({ ...BOM, site: 'http://spam.example' })
    expect(saida.success).toBe(false)
    expect(saida.error?.issues[0].path).toEqual(['site'])
  })

  it('recusa tipo fora da lista', () => {
    expect(solicitacaoSchema.safeParse({ ...BOM, tipo: 'reclamação' }).success).toBe(false)
  })
})

describe('lerFormData', () => {
  it('lê os campos do <form> e desserializa o contexto', () => {
    const dados = new FormData()
    for (const [chave, valor] of Object.entries(BOM)) dados.set(chave, valor)
    dados.set(
      'contexto',
      JSON.stringify({
        userAgent: 'Firefox',
        tela: '1280×720',
        idioma: 'pt-BR',
        enviadoEm: '11/08/2026 14:30 (UTC-03:00)',
      }),
    )

    const saida = solicitacaoSchema.safeParse(lerFormData(dados))
    expect(saida.success).toBe(true)
    expect(saida.data?.contexto?.idioma).toBe('pt-BR')
  })

  it('trata contexto ilegível como contexto ausente, sem derrubar o envio', () => {
    const dados = new FormData()
    for (const [chave, valor] of Object.entries(BOM)) dados.set(chave, valor)
    dados.set('contexto', '{isto não é json')

    const saida = solicitacaoSchema.safeParse(lerFormData(dados))
    expect(saida.success).toBe(true)
    expect(saida.data?.contexto).toBeUndefined()
  })
})
