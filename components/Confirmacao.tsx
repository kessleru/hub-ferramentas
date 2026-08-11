'use client'

import { AlertTriangle, Check, Copy, Mail, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { enderecoDeContato } from '@/app/acoes/solicitar'
import { Button } from '@/components/ui/button'

/**
 * §6.7 e §6.8 — as duas telas que substituem o formulário depois do envio.
 *
 * As duas animam na entrada (§9): elas *aparecem*, e é o aparecimento que a
 * pessoa precisa notar. Nada de toast comemorando — a confirmação na tela é o
 * aviso.
 */

const ANIMACAO = 'animate-in fade-in slide-in-from-bottom-2 duration-200'

/** Botão que copia e diz que copiou, sem toast. */
function BotaoCopiar({ texto }: { texto: string }) {
  const [copiou, definirCopiou] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      definirCopiou(true)
      setTimeout(() => definirCopiou(false), 2000)
    } catch {
      // Área de transferência negada pelo navegador: o texto continua na tela
      // para seleção manual, que é a saída que nunca falha.
      definirCopiou(false)
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copiar}>
      {copiou ? <Check className="text-sucesso" /> : <Copy />}
      {copiou ? 'Copiado' : 'Copiar o texto'}
    </Button>
  )
}

/**
 * §6.7 — a confirmação.
 *
 * "Copiar o texto" existe porque e-mail se perde e caixa de entrada enche. Com
 * o texto na mão, a pessoa reenvia por outro canal sem reescrever nada.
 */
export function Confirmacao({
  protocolo,
  texto,
  aoMandarOutra,
}: {
  protocolo: string
  texto: string
  aoMandarOutra: () => void
}) {
  return (
    <div
      className={`rounded-[10px] border border-sucesso/25 bg-sucesso-50 p-6 ${ANIMACAO}`}
      role="status"
    >
      <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-cinza-900">
        <Check className="size-4 shrink-0 text-sucesso" aria-hidden />
        Recebido —{' '}
        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-sm text-cinza-900">
          {protocolo}
        </code>
      </p>

      <p className="mt-3 text-sm text-cinza-600">
        Sua mensagem foi enviada para quem cuida das ferramentas. A resposta vai para o e-mail que
        você informou.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <BotaoCopiar texto={texto} />
        <Button type="button" variant="outline" size="sm" onClick={aoMandarOutra}>
          <RotateCcw />
          Mandar outra
        </Button>
      </div>
    </div>
  )
}

/**
 * §6.8 — quando o envio falha.
 *
 * Falha de rede, provedor fora do ar, chave vencida: tudo cai aqui, e a regra é
 * uma só — **o texto não se perde.** Ele continua no formulário logo abaixo.
 */
export function FalhaNoEnvio({
  texto,
  montarMailto,
}: {
  texto: string
  /** Recebe o endereço de destino e devolve o `mailto:` pronto (§6.8). */
  montarMailto: (destino: string) => string
}) {
  const [mailto, definirMailto] = useState<string | null>(null)
  const [buscando, definirBuscando] = useState(false)

  /**
   * §6.8 — o endereço de destino não está no bundle (§7.3), então o botão
   * busca-o numa ação mínima. É por isso que ele só aparece **depois** de uma
   * falha: antes disso não há motivo para o endereço sair do servidor.
   */
  async function abrirNoEmail() {
    definirBuscando(true)
    try {
      const destino = await enderecoDeContato()
      if (destino) definirMailto(montarMailto(destino))
    } catch {
      // Sem o endereço não há saída de emergência; as outras duas continuam.
    } finally {
      definirBuscando(false)
    }
  }

  return (
    <div className={`rounded-[10px] border border-erro/25 bg-erro-50 p-5 ${ANIMACAO}`} role="alert">
      <p className="flex items-center gap-2 text-[15px] font-medium text-cinza-900">
        <AlertTriangle className="size-4 shrink-0 text-erro" aria-hidden />
        Não consegui enviar.
      </p>

      <p className="mt-2 text-sm text-cinza-600">O texto continua aqui embaixo, inteiro.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {/* "Tentar de novo" é o próprio botão de enviar do formulário, que
            continua logo abaixo com tudo preenchido — um segundo botão que faz
            a mesma coisa só duplicaria o alvo. */}
        <BotaoCopiar texto={texto} />

        {mailto ? (
          <Button asChild variant="outline" size="sm">
            <a href={mailto}>
              <Mail />
              Abrir no meu e-mail
            </a>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={abrirNoEmail}
            disabled={buscando}
          >
            <Mail />
            {buscando ? 'Preparando…' : 'Abrir no meu e-mail'}
          </Button>
        )}
      </div>
    </div>
  )
}
