'use client'

import { Send, ShieldAlert } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useMemo, useState } from 'react'

import { ESTADO_INICIAL } from '@/app/acoes/estado'
import { enviarSolicitacao } from '@/app/acoes/solicitar'
import { Confirmacao, FalhaNoEnvio } from '@/components/Confirmacao'
import { ContextoEnviado } from '@/components/ContextoEnviado'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { montarContexto } from '@/lib/contexto'
import { contemDadoPessoal, MENSAGEM_DADO_PESSOAL } from '@/lib/dadoPessoal'
import { montarEmail, montarMailto } from '@/lib/email'
import { FERRAMENTAS } from '@/lib/ferramentas'
import { MAX_ASSUNTO, MAX_DESCRICAO, MOSTRAR_CONTADOR_FALTANDO } from '@/lib/limites'
import {
  ROTULO_DO_TIPO,
  SEM_FERRAMENTA,
  TIPOS,
  type Contexto,
  type Solicitacao,
  type TipoSolicitacao,
} from '@/lib/solicitacao'
import { cn } from '@/lib/utils'

/**
 * §6 — o formulário. Seis campos e nada mais.
 *
 * Urgência, setor, prioridade e "quantas pessoas isso afeta" foram considerados
 * e cortados: quem recebe é uma pessoa só, que lê tudo, e cada campo a mais é
 * uma chance a mais de desistir no meio.
 */

/**
 * §6.2 — o tipo escolhido troca o `placeholder` da descrição, porque a
 * diferença entre um relato útil e um inútil é saber o que contar.
 */
const PLACEHOLDER_DA_DESCRICAO: Record<TipoSolicitacao, string> = {
  defeito:
    'O que você fez, o que esperava que acontecesse e o que aconteceu. Se souber em qual passo foi, diga: «no passo 3, ao clicar em gerar».',
  melhoria: 'O que é chato hoje e como seria melhor. Pode contar como você faz atualmente.',
  ferramenta:
    'Que trabalho manual você quer parar de fazer? Quanto tempo ele leva e com que frequência acontece?',
  duvida: 'O que você está tentando fazer.',
}

/**
 * §6.1 — contador só quando falta pouco. Contador desde o primeiro caractere faz
 * a pessoa escrever menos, que é o oposto do que se quer numa descrição de
 * defeito. Num campo curto como o assunto, "pouco" é proporcionalmente menor.
 */
function faltaPouco(usados: number, maximo: number): boolean {
  return maximo - usados < Math.min(MOSTRAR_CONTADOR_FALTANDO, maximo / 4)
}

function Contador({ usados, maximo }: { usados: number; maximo: number }) {
  if (!faltaPouco(usados, maximo)) return null

  const restam = maximo - usados
  return (
    <span
      className={cn('text-xs tabular-nums', restam < 0 ? 'text-erro' : 'text-cinza-500')}
      aria-live="polite"
    >
      {restam} restantes
    </span>
  )
}

function MensagemDeErro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null
  return <p className="mt-1.5 text-xs text-erro">{mensagem}</p>
}

export function FormularioSolicitacao() {
  const parametros = useSearchParams()

  const [estado, acao, enviando] = useActionState(enviarSolicitacao, ESTADO_INICIAL)

  /**
   * §6.1 — `?ferramenta=` pré-seleciona o campo, e §5.4 — a busca sem resultado
   * manda para cá com o termo já escrito.
   *
   * Lidos no primeiro render, e não num efeito: o parâmetro é o **valor
   * inicial** do campo, não uma correção aplicada depois. Ler num efeito
   * significaria sobrescrever o que a pessoa já tivesse digitado.
   */
  const ferramentaPedida = parametros.get('ferramenta')
  const assuntoPedido = parametros.get('assunto')

  // §6.1 — todos os campos são controlados: é o que garante que trocar o tipo
  // (§6.2) e falhar o envio (§6.8) não apaguem o que já foi escrito.
  const [tipo, definirTipo] = useState<TipoSolicitacao>(() =>
    assuntoPedido ? 'ferramenta' : 'defeito',
  )
  const [ferramentaId, definirFerramentaId] = useState(() =>
    ferramentaPedida && FERRAMENTAS.some((f) => f.id === ferramentaPedida)
      ? ferramentaPedida
      : SEM_FERRAMENTA,
  )
  const [assunto, definirAssunto] = useState(() => (assuntoPedido ?? '').slice(0, MAX_ASSUNTO))
  const [descricao, definirDescricao] = useState('')
  const [nome, definirNome] = useState('')
  const [email, definirEmail] = useState('')

  const [contexto, definirContexto] = useState<Contexto | null>(null)
  const [bloqueio, definirBloqueio] = useState<string | null>(null)
  const [protocoloDispensado, definirProtocoloDispensado] = useState<string | null>(null)
  const [montadoEm, definirMontadoEm] = useState(0)

  /**
   * §6.4 — o contexto é montado no navegador, depois da hidratação, porque
   * `navigator` e `window` não existem no servidor. §7.5 — e o relógio do
   * "tempo mínimo" começa a contar quando a página monta.
   *
   * O `setState` dentro do efeito é intencional e é o padrão para ler API do
   * navegador: calcular no render quebraria a hidratação, e é justamente o
   * HTML do servidor que o §14 manda conferir.
   */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    definirMontadoEm(Date.now())
    try {
      definirContexto(montarContexto())
    } catch {
      // Sem `navigator` utilizável o envio continua: o contexto é opcional (§7.2).
      definirContexto(null)
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const solicitacaoAtual: Solicitacao = useMemo(
    () => ({
      tipo,
      ferramentaId,
      assunto,
      descricao,
      nome,
      email,
      contexto: contexto ?? undefined,
    }),
    [tipo, ferramentaId, assunto, descricao, nome, email, contexto],
  )

  const camposInvalidos = estado.situacao === 'invalido' ? estado.campos : {}

  // §6.5 / §7.6 — a mensagem é a mesma vinda da tela ou do servidor.
  const avisoDeDadoPessoal =
    bloqueio ?? (estado.situacao === 'dado-pessoal' ? estado.mensagem : null)

  const deuCerto = estado.situacao === 'enviado' && estado.protocolo !== protocoloDispensado

  function limpar() {
    definirProtocoloDispensado(estado.situacao === 'enviado' ? estado.protocolo : null)
    definirAssunto('')
    definirDescricao('')
    definirBloqueio(null)
    definirMontadoEm(Date.now())
    // Nome e e-mail ficam: quem manda uma segunda solicitação é a mesma pessoa.
  }

  if (deuCerto && estado.situacao === 'enviado') {
    return (
      <Confirmacao
        protocolo={estado.protocolo}
        texto={montarEmail(solicitacaoAtual, estado.protocolo).texto}
        aoMandarOutra={limpar}
      />
    )
  }

  return (
    <div className="space-y-4">
      {estado.situacao === 'erro' && (
        <FalhaNoEnvio
          texto={montarEmail(solicitacaoAtual, 'não gerado — o envio falhou').texto}
          montarMailto={(destino) =>
            montarMailto(destino, solicitacaoAtual, 'não gerado — o envio falhou')
          }
        />
      )}

      <form
        action={acao}
        /**
         * §6.5 — o único caso em que o envio para no navegador. Não é
         * "melhorar o envio" (§7.2 proíbe isso): o `<form action>` continua
         * sendo o caminho, e sem JavaScript este bloqueio simplesmente não
         * roda — aí quem recusa é o servidor (§7.6).
         */
        onSubmit={(evento) => {
          const achado = contemDadoPessoal(descricao)
          if (achado.encontrou) {
            evento.preventDefault()
            definirBloqueio(MENSAGEM_DADO_PESSOAL[achado.motivo!])
            return
          }
          definirBloqueio(null)
        }}
        className="rounded-[10px] border border-cinza-200 bg-white p-6"
        noValidate
      >
        {/* §7.5 — honeypot. Escondido por CSS, não por `type="hidden"`, que robô
            também ignora. Fora da ordem de tabulação e do leitor de tela. */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="site">Não preencha este campo</label>
          <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <input type="hidden" name="montadoEm" value={montadoEm || ''} readOnly />
        <input
          type="hidden"
          name="contexto"
          value={contexto ? JSON.stringify(contexto) : ''}
          readOnly
        />

        {/* Tipo — §6.1: quatro botões de escolha. São `radio` nativos por baixo,
            para que a escolha vá junto mesmo sem JavaScript (§7.2). */}
        <fieldset>
          <legend className="text-sm font-medium text-cinza-900">O que você quer?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TIPOS.map((valor) => (
              <label
                key={valor}
                className={cn(
                  'cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                  tipo === valor
                    ? 'border-brand-300 bg-brand-50 font-medium text-brand-800'
                    : 'border-cinza-200 bg-white text-cinza-600 hover:border-cinza-300',
                )}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={valor}
                  checked={tipo === valor}
                  onChange={() => definirTipo(valor)}
                  className="sr-only"
                />
                {ROTULO_DO_TIPO[valor]}
              </label>
            ))}
          </div>
          <MensagemDeErro mensagem={camposInvalidos.tipo} />
        </fieldset>

        {/* Ferramenta — §6.1 */}
        <div className="mt-5">
          <Label htmlFor="ferramentaId">Ferramenta</Label>
          {/*
            `<select>` nativo, e não o do shadcn (§3.2), por uma razão só: o do
            Radix só existe depois que o JavaScript roda, e o §7.2 exige que o
            formulário funcione sem ele. É a única troca de componente do
            projeto, e é a regra mais forte que decide.
          */}
          <select
            id="ferramentaId"
            name="ferramentaId"
            value={ferramentaId}
            onChange={(evento) => definirFerramentaId(evento.target.value)}
            className={cn(
              'mt-1.5 h-9 w-full rounded-lg border border-cinza-200 bg-white px-3 text-sm text-cinza-900',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
            )}
          >
            {FERRAMENTAS.map((ferramenta) => (
              <option key={ferramenta.id} value={ferramenta.id}>
                {ferramenta.nome}
              </option>
            ))}
            <option value={SEM_FERRAMENTA}>outra / nenhuma</option>
          </select>
          <MensagemDeErro mensagem={camposInvalidos.ferramentaId} />
        </div>

        {/* Assunto — §6.1 */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="assunto">Assunto</Label>
            <Contador usados={assunto.length} maximo={MAX_ASSUNTO} />
          </div>
          <Input
            id="assunto"
            name="assunto"
            value={assunto}
            onChange={(evento) => definirAssunto(evento.target.value)}
            maxLength={MAX_ASSUNTO}
            placeholder="Em uma linha, qual é o caso"
            className="mt-1.5"
            aria-invalid={Boolean(camposInvalidos.assunto)}
          />
          <MensagemDeErro mensagem={camposInvalidos.assunto} />
        </div>

        {/* Descrição — §6.1 e §6.2 */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor="descricao">Descrição</Label>
            <Contador usados={descricao.length} maximo={MAX_DESCRICAO} />
          </div>
          <Textarea
            id="descricao"
            name="descricao"
            value={descricao}
            onChange={(evento) => {
              definirDescricao(evento.target.value)
              if (bloqueio) definirBloqueio(null)
            }}
            maxLength={MAX_DESCRICAO}
            rows={6}
            /* §6.2 — trocar o `placeholder` não apaga o que já foi digitado. */
            placeholder={PLACEHOLDER_DA_DESCRICAO[tipo]}
            className="mt-1.5"
            aria-invalid={Boolean(camposInvalidos.descricao)}
          />
          <MensagemDeErro mensagem={camposInvalidos.descricao} />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="nome">Seu nome</Label>
            <Input
              id="nome"
              name="nome"
              value={nome}
              onChange={(evento) => definirNome(evento.target.value)}
              maxLength={120}
              autoComplete="name"
              className="mt-1.5"
              aria-invalid={Boolean(camposInvalidos.nome)}
            />
            <MensagemDeErro mensagem={camposInvalidos.nome} />
          </div>

          <div>
            <Label htmlFor="email">Seu e-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(evento) => definirEmail(evento.target.value)}
              maxLength={180}
              autoComplete="email"
              className="mt-1.5"
              aria-invalid={Boolean(camposInvalidos.email)}
            />
            {/* §7.4 — é este endereço que vira o `Reply-To`. */}
            <MensagemDeErro mensagem={camposInvalidos.email} />
          </div>
        </div>

        <div className="mt-6">
          <ContextoEnviado contexto={contexto} />
        </div>

        {/* §6.5 — sempre visível, não só quando dá erro. */}
        <div className="mt-4 rounded-lg border border-aviso/25 bg-aviso-50 p-3">
          <p className="flex gap-2 text-xs leading-relaxed text-cinza-700">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-aviso" aria-hidden />
            <span>
              <strong className="font-medium">
                Não cole lista de pessoas, CPF ou trecho de documento aqui.
              </strong>{' '}
              Esta é a única tela da família que envia algo para fora do seu computador. Para
              relatar um defeito, descreva o que aconteceu.
            </span>
          </p>
        </div>

        {avisoDeDadoPessoal && (
          <p
            role="alert"
            className="mt-3 animate-in fade-in slide-in-from-bottom-1 rounded-lg border border-erro/25 bg-erro-50 p-3 text-sm text-erro duration-200"
          >
            {avisoDeDadoPessoal} O texto continua aqui — é só tirar os dados e mandar de novo.
          </p>
        )}

        {/* §9 — o único botão primário azul da página. */}
        <div className="mt-5">
          <Button type="submit" disabled={enviando}>
            <Send />
            {enviando ? 'Enviando…' : 'Enviar solicitação'}
          </Button>
        </div>
      </form>
    </div>
  )
}
