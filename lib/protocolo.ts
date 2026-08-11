/**
 * §7.4 — o protocolo: `SOL-AAAA-MMDD-XXXX`.
 *
 * Vai no assunto do e-mail, no corpo e na tela (§6.7): serve para a pessoa
 * citar ("mandei a SOL-2026-0811-A3F2") e para achar na caixa de entrada.
 * **Não identifica nada** — não há banco.
 */

/**
 * Sem `0/O` e sem `1/I`: o protocolo é lido em voz alta e digitado à mão numa
 * busca de caixa de entrada, e é aí que os parecidos custam caro.
 */
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const QUANTIDADE_ALEATORIA = 4

function sorteados(quantidade: number): string {
  const bytes = new Uint8Array(quantidade)
  crypto.getRandomValues(bytes)

  let saida = ''
  for (const byte of bytes) {
    saida += ALFABETO[byte % ALFABETO.length]
  }
  return saida
}

function doisDigitos(numero: number): string {
  return String(numero).padStart(2, '0')
}

/**
 * `agora` é parâmetro para o teste conseguir fixar a data sem mexer no relógio
 * do processo.
 */
export function gerarProtocolo(agora: Date = new Date()): string {
  const ano = agora.getFullYear()
  const mes = doisDigitos(agora.getMonth() + 1)
  const dia = doisDigitos(agora.getDate())

  return `SOL-${ano}-${mes}${dia}-${sorteados(QUANTIDADE_ALEATORIA)}`
}

export const FORMATO_DO_PROTOCOLO = /^SOL-\d{4}-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/
