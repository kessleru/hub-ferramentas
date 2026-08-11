import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { EstadoDoEnvio } from '@/app/acoes/estado'

/**
 * §11 — o que só teste de componente pega.
 *
 * A ação é substituída por um espião: aqui o que se prova é a tela, e o §11 já
 * prova a ação em `acaoSolicitar.test.ts`.
 */
const acaoEspia = vi.hoisted(() => vi.fn())
const enderecoEspia = vi.hoisted(() => vi.fn())
const parametros = vi.hoisted(() => new URLSearchParams())

vi.mock('@/app/acoes/solicitar', () => ({
  enviarSolicitacao: acaoEspia,
  enderecoDeContato: enderecoEspia,
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => parametros,
}))

const { FormularioSolicitacao } = await import('@/components/FormularioSolicitacao')

const CAMPOS = {
  Assunto: 'Não gera quando o nome tem acento',
  Descrição: 'Subi o modelo, colei a lista e cliquei em gerar. Não baixou nada e a tela travou.',
  'Seu nome': 'Maria Silva',
  'Seu e-mail': 'maria@exemplo.com.br',
}

async function preencher(usuario: ReturnType<typeof userEvent.setup>) {
  for (const [rotulo, valor] of Object.entries(CAMPOS)) {
    await usuario.type(screen.getByLabelText(rotulo), valor)
  }
}

beforeEach(() => {
  acaoEspia.mockReset()
  enderecoEspia.mockReset()
  parametros.forEach((_, chave) => parametros.delete(chave))
  // Por padrão, a ação não responde nada de especial.
  acaoEspia.mockImplementation(async (estado: EstadoDoEnvio) => estado)
})

describe('FormularioSolicitacao', () => {
  it('trocar o tipo NÃO apaga a descrição já digitada (§6.2)', async () => {
    const usuario = userEvent.setup()
    render(<FormularioSolicitacao />)

    const descricao = screen.getByLabelText('Descrição')
    await usuario.type(descricao, 'Escrevi dez minutos disso aqui')

    await usuario.click(screen.getByText('melhoria'))

    expect(descricao).toHaveValue('Escrevi dez minutos disso aqui')
    // E o placeholder mudou, que é o ponto do §6.2.
    expect(descricao).toHaveAttribute('placeholder', expect.stringContaining('O que é chato hoje'))
  })

  it('descrição com CPF NÃO envia: a ação não é chamada e o texto continua (§6.5)', async () => {
    const usuario = userEvent.setup()
    render(<FormularioSolicitacao />)

    await usuario.type(screen.getByLabelText('Assunto'), CAMPOS.Assunto)
    await usuario.type(screen.getByLabelText('Seu nome'), CAMPOS['Seu nome'])
    await usuario.type(screen.getByLabelText('Seu e-mail'), CAMPOS['Seu e-mail'])

    const descricao = screen.getByLabelText('Descrição')
    const textoComCpf = 'A pessoa 529.982.247-25 não recebeu o certificado, pode conferir?'
    await usuario.type(descricao, textoComCpf)

    await usuario.click(screen.getByRole('button', { name: /Enviar solicitação/ }))

    expect(acaoEspia).not.toHaveBeenCalled()
    expect(descricao).toHaveValue(textoComCpf)
    expect(await screen.findByRole('alert')).toHaveTextContent(/Parece que tem CPF/)
  })

  it('envio bom troca o formulário pela confirmação, com o protocolo da ação (§6.7)', async () => {
    acaoEspia.mockResolvedValue({ situacao: 'enviado', protocolo: 'SOL-2026-0811-A3F2' })

    const usuario = userEvent.setup()
    render(<FormularioSolicitacao />)
    await preencher(usuario)

    await usuario.click(screen.getByRole('button', { name: /Enviar solicitação/ }))

    expect(await screen.findByText('SOL-2026-0811-A3F2')).toBeInTheDocument()
    expect(screen.queryByLabelText('Descrição')).toBeNull()
  })

  it('falha do envio mantém o texto e mostra as saídas do §6.8', async () => {
    acaoEspia.mockResolvedValue({ situacao: 'erro' })

    const usuario = userEvent.setup()
    render(<FormularioSolicitacao />)
    await preencher(usuario)

    await usuario.click(screen.getByRole('button', { name: /Enviar solicitação/ }))

    expect(await screen.findByText('Não consegui enviar.')).toBeInTheDocument()
    // O texto não se perde — é a regra única do §6.8.
    expect(screen.getByLabelText('Descrição')).toHaveValue(CAMPOS.Descrição)
    expect(screen.getByRole('button', { name: /Copiar o texto/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abrir no meu e-mail/ })).toBeInTheDocument()
    // "Tentar de novo" é o próprio botão de enviar, que continua na tela.
    expect(screen.getByRole('button', { name: /Enviar solicitação/ })).toBeInTheDocument()
  })

  it('o endereço de destino só sai do servidor depois da falha (§6.8 / §7.3)', async () => {
    acaoEspia.mockResolvedValue({ situacao: 'erro' })
    enderecoEspia.mockResolvedValue('destino@exemplo.com.br')

    const usuario = userEvent.setup()
    render(<FormularioSolicitacao />)
    await preencher(usuario)
    await usuario.click(screen.getByRole('button', { name: /Enviar solicitação/ }))

    await screen.findByText('Não consegui enviar.')
    expect(enderecoEspia).not.toHaveBeenCalled()

    await usuario.click(screen.getByRole('button', { name: /Abrir no meu e-mail/ }))

    await waitFor(() => expect(enderecoEspia).toHaveBeenCalledTimes(1))
    const link = await screen.findByRole('link', { name: /Abrir no meu e-mail/ })
    expect(link.getAttribute('href')).toContain('mailto:destino@exemplo.com.br')
  })

  it('`?ferramenta=` chega com o select naquela ferramenta (§6.1)', () => {
    parametros.set('ferramenta', 'visualizador-documentos')
    render(<FormularioSolicitacao />)

    expect(screen.getByLabelText('Ferramenta')).toHaveValue('visualizador-documentos')
  })

  it('mostra sempre o aviso de dado pessoal, não só quando dá erro (§6.5)', () => {
    render(<FormularioSolicitacao />)
    expect(screen.getByText(/Não cole lista de pessoas, CPF/)).toBeInTheDocument()
  })

  it('o bloco do §6.4 mostra o que vai junto com a mensagem', async () => {
    render(<FormularioSolicitacao />)

    await userEvent.setup().click(screen.getByText('O que vai junto com a sua mensagem'))
    expect(await screen.findByText('Navegador e sistema:')).toBeInTheDocument()
  })
})
