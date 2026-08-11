import { describe, expect, it } from 'vitest'

import { montarAssunto, montarEmail, montarMailto } from '@/lib/email'
import type { Solicitacao } from '@/lib/solicitacao'

const SOLICITACAO: Solicitacao = {
  tipo: 'defeito',
  ferramentaId: 'gerador-certificados',
  assunto: 'Não gera quando o nome tem acento',
  descricao: 'Subi o modelo, colei a lista e cliquei em gerar. Não baixou nada e a tela travou.',
  nome: 'Maria Silva',
  email: 'maria@exemplo.com.br',
  contexto: {
    userAgent: 'Mozilla/5.0 Firefox/141.0',
    tela: '1280×720',
    idioma: 'pt-BR',
    enviadoEm: '11/08/2026 14:30 (UTC-03:00)',
  },
}

describe('montarAssunto', () => {
  it('tem o tipo e o nome da ferramenta', () => {
    expect(montarAssunto(SOLICITACAO)).toBe(
      '[defeito · Gerador de Certificados] Não gera quando o nome tem acento',
    )
  })

  it('usa o rótulo legível do tipo', () => {
    expect(montarAssunto({ ...SOLICITACAO, tipo: 'ferramenta' })).toContain('[ferramenta nova ·')
    expect(montarAssunto({ ...SOLICITACAO, tipo: 'duvida' })).toContain('[dúvida ·')
  })

  it('diz "outra / nenhuma" quando não foi escolhida ferramenta', () => {
    expect(montarAssunto({ ...SOLICITACAO, ferramentaId: 'outra' })).toContain('outra / nenhuma')
  })
})

describe('montarEmail', () => {
  it('tem o protocolo, a descrição inteira e o contexto no fim', () => {
    const { texto } = montarEmail(SOLICITACAO, 'SOL-2026-0811-A3F2')

    expect(texto).toContain('Protocolo: SOL-2026-0811-A3F2')
    expect(texto).toContain(SOLICITACAO.descricao)
    expect(texto).toContain('Maria Silva <maria@exemplo.com.br>')

    const posicaoDescricao = texto.indexOf(SOLICITACAO.descricao)
    const posicaoContexto = texto.indexOf('Mozilla/5.0 Firefox/141.0')
    expect(posicaoContexto).toBeGreaterThan(posicaoDescricao)
  })

  it('diz que o contexto não veio quando o envio foi sem JavaScript (§7.2)', () => {
    const { texto } = montarEmail({ ...SOLICITACAO, contexto: undefined }, 'SOL-2026-0811-A3F2')
    expect(texto).toContain('JavaScript desligado')
  })
})

describe('montarMailto', () => {
  it('leva o mesmo assunto e o mesmo corpo do e-mail de verdade (§6.8)', () => {
    const link = montarMailto('destino@exemplo.com.br', SOLICITACAO, 'SOL-2026-0811-A3F2')
    expect(link.startsWith('mailto:destino@exemplo.com.br?')).toBe(true)

    const parametros = new URL(link).searchParams
    expect(parametros.get('subject')).toBe(montarAssunto(SOLICITACAO))
    expect(parametros.get('body')).toContain(SOLICITACAO.descricao)
  })
})
