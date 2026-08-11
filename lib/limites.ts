/**
 * §5.4 — o campo de busca aparece a partir deste número de ferramentas
 * *ativas*.
 *
 * Com duas ferramentas, campo de busca é mobília: a pessoa lê as duas mais
 * rápido do que digita. A constante mora sozinha aqui de propósito — um número,
 * um lugar.
 */
export const MOSTRAR_BUSCA_A_PARTIR_DE = 7

/**
 * §6.1 — os limites de tamanho dos campos do formulário, repetidos no schema
 * (§6.6) e no contador de caracteres da tela.
 */
export const MAX_ASSUNTO = 120
export const MAX_DESCRICAO = 4000

/**
 * §6.1 — o contador de caracteres só aparece quando faltam menos que isto.
 * Contador desde o primeiro caractere faz a pessoa escrever menos, que é o
 * oposto do que se quer numa descrição de defeito.
 */
export const MOSTRAR_CONTADOR_FALTANDO = 200

/**
 * §7.5 — menos que isto entre a página montar e o envio é robô.
 */
export const TEMPO_MINIMO_MS = 3_000
