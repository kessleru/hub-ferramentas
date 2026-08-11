/**
 * O estado que a Server Action devolve para o `useActionState`.
 *
 * Mora fora do arquivo com `'use server'` de propósito: lá só podem sair
 * funções `async`, e um tipo não é uma delas.
 *
 * §7.2 — **a resposta nunca ecoa o que chegou.** Devolve o protocolo, ou o nome
 * do campo inválido. Mais nada. Nem o texto, nem o e-mail, nem o contexto.
 */
export type EstadoDoEnvio =
  | { situacao: 'inicial' }
  /** §6.7 — deu certo; a tela troca o card pela confirmação com o protocolo. */
  | { situacao: 'enviado'; protocolo: string }
  /** §6.6 — recusado por campo, para a tela dizer qual consertar. */
  | { situacao: 'invalido'; campos: Record<string, string> }
  /** §6.5 / §7.6 — dado pessoal na descrição. */
  | { situacao: 'dado-pessoal'; mensagem: string }
  /** §6.8 — falhou o envio; a tela mostra as três saídas e guarda o texto. */
  | { situacao: 'erro' }

export const ESTADO_INICIAL: EstadoDoEnvio = { situacao: 'inicial' }
