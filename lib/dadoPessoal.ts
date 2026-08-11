/**
 * §6.5 / §7.6 — a heurística que impede lista de pessoas e CPF de viajarem no
 * formulário.
 *
 * Pura e testável de propósito: é a regra mais delicada do projeto. O §11 avisa
 * qual é o defeito mais provável daqui, e não é deixar passar um CPF — é
 * **bloquear quem só queria relatar um defeito**. Telefone, CEP, número de
 * processo, data e lista de passos numerados têm que passar.
 *
 * É heurística, não garantia. Ela existe para pegar o caso comum (alguém cola a
 * turma inteira no campo) com o mínimo de estorvo para o caso honesto.
 */

export type MotivoDadoPessoal = 'cpf' | 'lista'

export interface ResultadoDadoPessoal {
  encontrou: boolean
  motivo?: MotivoDadoPessoal
}

/** CPF escrito com a pontuação dele: 123.456.789-01. A forma é a declaração. */
const CPF_PONTUADO = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/

/** Onze dígitos seguidos, sem pontuação nenhuma — ambíguo com telefone celular. */
const ONZE_DIGITOS = /(?<!\d)\d{11}(?!\d)/g

/**
 * Os dígitos verificadores do CPF.
 *
 * É isto que separa `12345678901` (telefone de alguém) de um CPF de verdade:
 * um número de telefone só passa por aqui em 1% das vezes, enquanto **todo**
 * CPF real passa. Sem esta conta, qualquer celular com DDD viraria bloqueio.
 */
function temDigitosVerificadoresDeCpf(digitos: string): boolean {
  // 00000000000, 11111111111… passam na conta mas não são CPF de ninguém.
  if (/^(\d)\1{10}$/.test(digitos)) return false

  const numeros = digitos.split('').map(Number)

  for (const [tamanho, posicao] of [
    [9, 9],
    [10, 10],
  ]) {
    let soma = 0
    for (let i = 0; i < tamanho; i++) {
      soma += numeros[i] * (tamanho + 1 - i)
    }
    const resto = (soma * 10) % 11
    const esperado = resto === 10 ? 0 : resto
    if (esperado !== numeros[posicao]) return false
  }

  return true
}

export function pareceCpf(texto: string): boolean {
  if (CPF_PONTUADO.test(texto)) return true

  for (const achado of texto.matchAll(ONZE_DIGITOS)) {
    if (temDigitosVerificadoresDeCpf(achado[0])) return true
  }

  return false
}

/**
 * Partículas que aparecem em nome de gente e continuam minúsculas: "Maria da
 * Silva". Fora desta lista, palavra minúscula é sinal de frase, não de nome.
 */
const PARTICULAS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'del', 'di', 'du', 'van', 'von'])

const LINHA_NUMERADA = /^\s*\d{1,3}\s*[.)-]\s*(.+?)\s*$/

/**
 * Verbos com que um passo começa. `1. Gerar Certificado` tem a mesma forma de
 * `1. Maria Silva` — duas palavras maiúsculas —, e é o §6.2 que pede à pessoa
 * para escrever passos assim. Esta lista é o desempate mais barato entre os
 * dois casos, e erra para o lado de deixar passar (§11).
 */
const VERBOS_DE_PASSO = new Set([
  'abri', 'abrir', 'apertei', 'apertar', 'baixei', 'baixar', 'cliquei', 'clicar',
  'colei', 'colar', 'criei', 'criar', 'digitei', 'digitar', 'entrei', 'entrar',
  'enviei', 'enviar', 'escolhi', 'escolher', 'esperava', 'exportei', 'exportar',
  'fechei', 'fechar', 'fui', 'gerar', 'gerei', 'importei', 'importar', 'ir',
  'marquei', 'marcar', 'mudei', 'mudar', 'preenchi', 'preencher', 'salvei',
  'salvar', 'selecionei', 'selecionar', 'subi', 'subir', 'tentei', 'tentar',
  'troquei', 'trocar', 'usei', 'usar', 'voltei', 'voltar',
])

function semAcento(palavra: string): string {
  return palavra
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

/**
 * Uma linha `1. MARIA DA SILVA` é lista de turma. Uma linha `1. Cliquei em
 * gerar` é o passo que o §6.2 **pede** que a pessoa escreva — e é por isso que
 * não basta contar linhas numeradas.
 */
function pareceNomeDePessoa(trecho: string): boolean {
  // Nome não termina em ponto final nem tem pontuação de frase no meio.
  if (/[.,;:!?]/.test(trecho)) return false

  const palavras = trecho.split(/\s+/).filter(Boolean)

  // Nome de gente tem pelo menos duas palavras; mais de seis já é frase.
  if (palavras.length < 2 || palavras.length > 6) return false

  // Passo do §6.2, não pessoa.
  if (VERBOS_DE_PASSO.has(semAcento(palavras[0]))) return false

  return palavras.every((palavra, indice) => {
    if (!/^\p{L}[\p{L}'’-]*$/u.test(palavra)) return false

    const primeira = palavra[0]
    const comecaMaiuscula = primeira === primeira.toLocaleUpperCase('pt-BR')

    // A primeira e a última palavra têm que ser maiúsculas: "da Silva" existe,
    // "Maria da" não é nome completo e "Abri o gerador" morre aqui.
    if (indice === 0 || indice === palavras.length - 1) return comecaMaiuscula

    return comecaMaiuscula || PARTICULAS.has(palavra.toLocaleLowerCase('pt-BR'))
  })
}

/** §6.5 — três ou mais linhas no formato `número. NOME`. */
export function pareceListaDePessoas(texto: string): boolean {
  const linhas = texto.split(/\r?\n/)
  let quantas = 0

  for (const linha of linhas) {
    const achado = LINHA_NUMERADA.exec(linha)
    if (achado && pareceNomeDePessoa(achado[1])) {
      quantas += 1
      if (quantas >= 3) return true
    }
  }

  return false
}

export function contemDadoPessoal(texto: string): ResultadoDadoPessoal {
  if (pareceCpf(texto)) return { encontrou: true, motivo: 'cpf' }
  if (pareceListaDePessoas(texto)) return { encontrou: true, motivo: 'lista' }
  return { encontrou: false }
}

/**
 * §6.5 — a mensagem é a mesma na tela e na resposta do servidor, porque é a
 * mesma situação. Aviso com bloqueio, não bloqueio silencioso: o texto continua
 * no campo, a pessoa edita e reenvia.
 */
export const MENSAGEM_DADO_PESSOAL: Record<MotivoDadoPessoal, string> = {
  cpf: 'Parece que tem CPF aí. Tire os dados das pessoas e mande de novo.',
  lista: 'Parece que tem uma lista de pessoas aí. Tire os dados delas e mande de novo.',
}
