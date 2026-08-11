import type { Contexto } from '@/lib/solicitacao'

/**
 * §6.4 — o contexto que vai junto da mensagem, e que a pessoa **vê** antes de
 * enviar, num bloco recolhido.
 *
 * É o que responde "só acontece no Firefox" e "a tela dela é pequena" sem uma
 * rodada de perguntas. Nada de fingerprint, nada de identificador persistente:
 * só o que já viaja em qualquer requisição, mais o tamanho da janela.
 */
export function montarContexto(): Contexto {
  return {
    userAgent: navigator.userAgent.slice(0, 400),
    tela: `${window.innerWidth}×${window.innerHeight}`,
    idioma: navigator.language,
    enviadoEm: formatarDataComFuso(new Date()),
  }
}

/** Data e hora com fuso — sem o fuso, "14h" não quer dizer nada num relato. */
export function formatarDataComFuso(quando: Date): string {
  const data = quando.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  const minutos = -quando.getTimezoneOffset()
  const sinal = minutos >= 0 ? '+' : '-'
  const horas = String(Math.floor(Math.abs(minutos) / 60)).padStart(2, '0')
  const resto = String(Math.abs(minutos) % 60).padStart(2, '0')

  return `${data} (UTC${sinal}${horas}:${resto})`
}

/** §6.4 — os mesmos rótulos na tela e no e-mail, para conferir que bate. */
export const ROTULO_DO_CONTEXTO: Record<keyof Contexto, string> = {
  userAgent: 'Navegador e sistema',
  tela: 'Tamanho da janela',
  idioma: 'Idioma',
  enviadoEm: 'Data e hora',
}
