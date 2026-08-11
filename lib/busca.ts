import type { Ferramenta } from '@/lib/ferramentas'

/**
 * §5.4 — a busca do catálogo. Função pura, para que o teste do §11 não precise
 * montar tela.
 */

/**
 * Sem acento e sem caixa: quem digita "integracao" com pressa tem que achar
 * "integração".
 */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * §5.4 — filtra por `nome`, `resumo` e `tags`. **Não** por `descricao`: casar no
 * texto longo devolve tudo, e uma busca que devolve tudo não é busca.
 */
function textoBuscavel(ferramenta: Ferramenta): string {
  return normalizar([ferramenta.nome, ferramenta.resumo, ...ferramenta.tags].join(' '))
}

export function filtrar(ferramentas: Ferramenta[], termo: string): Ferramenta[] {
  const alvo = normalizar(termo)

  // Busca vazia devolve tudo — o estado inicial da tela é o catálogo inteiro.
  if (alvo === '') return ferramentas

  // Várias palavras: todas precisam casar. "docx turma" acha o gerador e não o
  // visualizador, que é o que quem digitou as duas queria.
  const termos = alvo.split(/\s+/)

  return ferramentas.filter((ferramenta) => {
    const texto = textoBuscavel(ferramenta)
    return termos.every((t) => texto.includes(t))
  })
}
