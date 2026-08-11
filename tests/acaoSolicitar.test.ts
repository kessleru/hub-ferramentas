import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ESTADO_INICIAL } from '@/app/acoes/estado'
import { FORMATO_DO_PROTOCOLO } from '@/lib/protocolo'
import { TEMPO_MINIMO_MS } from '@/lib/limites'

/**
 * §11 — os testes da ação, **sem rede**: o SDK do Resend é substituído por um
 * espião, e o que se prova é o que a ação faz, não o que o provedor faz.
 */
const enviarEmail = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: enviarEmail }
  },
}))

const { enviarSolicitacao } = await import('@/app/acoes/solicitar')

const CAMPOS_BONS: Record<string, string> = {
  tipo: 'defeito',
  ferramentaId: 'gerador-certificados',
  assunto: 'Não gera quando o nome tem acento',
  descricao: 'Subi o modelo, colei a lista e cliquei em gerar. Não baixou nada e a tela travou.',
  nome: 'Maria Silva',
  email: 'maria@exemplo.com.br',
}

/** Por padrão o envio vem de gente: passou do tempo mínimo e sem honeypot. */
function montarFormData(mudancas: Record<string, string> = {}): FormData {
  const dados = new FormData()
  for (const [chave, valor] of Object.entries({ ...CAMPOS_BONS, ...mudancas })) {
    dados.set(chave, valor)
  }
  if (!('montadoEm' in mudancas)) {
    dados.set('montadoEm', String(Date.now() - TEMPO_MINIMO_MS - 1000))
  }
  return dados
}

beforeEach(() => {
  enviarEmail.mockReset()
  enviarEmail.mockResolvedValue({ data: { id: 'abc' }, error: null })

  process.env.RESEND_API_KEY = 're_teste'
  process.env.EMAIL_DESTINO = 'destino@exemplo.com.br'
  process.env.EMAIL_REMETENTE = 'ferramentas@exemplo.com.br'
})

describe('enviarSolicitacao', () => {
  it('com dados válidos, envia uma vez e devolve o protocolo', async () => {
    const saida = await enviarSolicitacao(ESTADO_INICIAL, montarFormData())

    expect(saida.situacao).toBe('enviado')
    expect(saida.situacao === 'enviado' && saida.protocolo).toMatch(FORMATO_DO_PROTOCOLO)
    expect(enviarEmail).toHaveBeenCalledTimes(1)
  })

  it('manda o `replyTo` com o e-mail de quem pediu — é o que fecha o ciclo (§7.4)', async () => {
    await enviarSolicitacao(ESTADO_INICIAL, montarFormData())

    expect(enviarEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'Maria Silva <maria@exemplo.com.br>',
        to: 'destino@exemplo.com.br',
        from: 'ferramentas@exemplo.com.br',
      }),
    )
  })

  it('o protocolo devolvido é o mesmo que vai no assunto do e-mail (§14)', async () => {
    const saida = await enviarSolicitacao(ESTADO_INICIAL, montarFormData())
    const corpo = enviarEmail.mock.calls[0][0]

    expect(saida.situacao).toBe('enviado')
    if (saida.situacao !== 'enviado') return
    expect(corpo.text).toContain(saida.protocolo)
  })

  it('honeypot preenchido → sucesso SEM chamar o envio (§7.5)', async () => {
    const saida = await enviarSolicitacao(
      ESTADO_INICIAL,
      montarFormData({ site: 'http://spam.example' }),
    )

    expect(saida.situacao).toBe('enviado')
    expect(enviarEmail).not.toHaveBeenCalled()
  })

  it('envio rápido demais → sucesso SEM chamar o envio (§7.5)', async () => {
    const saida = await enviarSolicitacao(
      ESTADO_INICIAL,
      montarFormData({ montadoEm: String(Date.now()) }),
    )

    expect(saida.situacao).toBe('enviado')
    expect(enviarEmail).not.toHaveBeenCalled()
  })

  it('sem `montadoEm` (envio sem JavaScript) o envio passa (§7.2)', async () => {
    const dados = montarFormData()
    dados.delete('montadoEm')

    const saida = await enviarSolicitacao(ESTADO_INICIAL, dados)

    expect(saida.situacao).toBe('enviado')
    expect(enviarEmail).toHaveBeenCalledTimes(1)
  })

  it('dados inválidos → devolve o campo, sem enviar', async () => {
    const saida = await enviarSolicitacao(ESTADO_INICIAL, montarFormData({ email: 'não é e-mail' }))

    expect(saida.situacao).toBe('invalido')
    expect(saida.situacao === 'invalido' && saida.campos.email).toBeTruthy()
    expect(enviarEmail).not.toHaveBeenCalled()
  })

  it('CPF na descrição → recusa, mesmo que o navegador tenha deixado passar (§7.6)', async () => {
    const saida = await enviarSolicitacao(
      ESTADO_INICIAL,
      montarFormData({
        descricao: 'A pessoa 529.982.247-25 não recebeu o certificado dela, pode conferir?',
      }),
    )

    expect(saida.situacao).toBe('dado-pessoal')
    expect(enviarEmail).not.toHaveBeenCalled()
  })

  it('provedor recusando → erro genérico, sem vazar o detalhe para a tela (§7.2)', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    enviarEmail.mockResolvedValue({ data: null, error: { message: 'chave vencida' } })

    const saida = await enviarSolicitacao(ESTADO_INICIAL, montarFormData())

    expect(saida).toEqual({ situacao: 'erro' })
    expect(JSON.stringify(saida)).not.toContain('chave vencida')
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })

  it('sem as variáveis de ambiente, falha como erro de envio e diz qual falta no log (§7.3)', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    delete process.env.RESEND_API_KEY

    const saida = await enviarSolicitacao(ESTADO_INICIAL, montarFormData())

    expect(saida).toEqual({ situacao: 'erro' })
    expect(enviarEmail).not.toHaveBeenCalled()
    expect(String(log.mock.calls[0]?.[1])).toContain('RESEND_API_KEY')
    log.mockRestore()
  })

  it('a resposta nunca ecoa o que chegou (§7.2)', async () => {
    const saida = await enviarSolicitacao(ESTADO_INICIAL, montarFormData())
    const comoTexto = JSON.stringify(saida)

    expect(comoTexto).not.toContain('maria@exemplo.com.br')
    expect(comoTexto).not.toContain('Maria Silva')
    expect(comoTexto).not.toContain('Subi o modelo')
  })
})
