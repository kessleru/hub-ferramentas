import { FileBadge, Files, type LucideIcon } from 'lucide-react'

/**
 * §4 — O CATÁLOGO. Fonte única da verdade, lida no build.
 *
 * Sem rede, sem importação dinâmica, sem CMS: acrescentar ferramenta é editar
 * este arquivo e fazer deploy, e o TypeScript recusa a entrada incompleta antes
 * do commit.
 */

export type EstadoFerramenta = 'ativa' | 'beta' | 'construcao' | 'planejada'

export interface Ferramenta {
  /** estável; entra na URL (`?ferramenta=`) e no e-mail de toda solicitação. Nunca reaproveite */
  id: string
  nome: string
  /** uma linha, na tela do card. Sem ponto final, sem "esta ferramenta permite" */
  resumo: string
  /** duas ou três linhas: o problema que ela resolve, na língua de quem tem o problema */
  descricao: string
  /** ausente quando `estado` é 'planejada' — é o que faz o card não ser clicável (§4.3) */
  url?: string
  estado: EstadoFerramenta
  /**
   * ícone do lucide-react. Um por ferramenta, nunca repetido.
   *
   * Escolha o que **combina com o favicon da ferramenta** (`PADRAO-FAVICON.md`):
   * o card e a aba são a mesma coisa vista em dois lugares, e o hub existe para
   * quem ainda não sabe qual aba é qual.
   */
  icone: LucideIcon
  /** para a busca do §5.4 e para agrupar quando forem muitas */
  tags: string[]
  /** o que a ferramenta faz com os dados. Vira o selo do card (§5.3) */
  privacidade: 'local' | 'servidor'
  /** opcional; só aparece se existir */
  repositorio?: string
  /** ISO `AAAA-MM-DD`. Alimenta o selo "novidade" do §13.2 */
  atualizadaEm?: string
}

/**
 * §4.1 — três regras que o resto do código assume:
 *
 * 1. `id` é para sempre. Ele aparece na URL e no e-mail de toda solicitação já
 *    enviada; trocá-lo quebra o histórico da caixa de entrada.
 * 2. `url` ausente é o sinal de "ainda não existe". Não use `url: '#'` nem
 *    string vazia — o card decide se é link ou bloco inerte pela presença do
 *    campo, e string vazia produz um link que recarrega a página.
 * 3. `privacidade` é declaração, não enfeite. `'local'` significa que a
 *    ferramenta não manda dado para servidor nenhum.
 */
export const FERRAMENTAS: Ferramenta[] = [
  {
    id: 'gerador-certificados',
    nome: 'Gerador de Certificados',
    resumo: 'Um certificado por pessoa, a partir de um modelo do Word',
    descricao:
      'Você sobe o modelo .docx, cola a lista da turma (nome e CPF) e baixa um .zip com um ' +
      'arquivo por pessoa. Trata concordância de Sr./Sra., notas e média final, e guarda quem já ' +
      'foi certificado para conferir a lista da próxima turma.',
    url: 'https://gerador-certificados-five.vercel.app',
    estado: 'ativa',
    // Folha com selo — o mesmo desenho do favicon dela (PADRAO-FAVICON.md §3.2).
    icone: FileBadge,
    tags: ['certificado', 'docx', 'turma', 'cipa', 'integração'],
    privacidade: 'local',
  },
  {
    id: 'visualizador-documentos',
    nome: 'Visualizador de Documentos',
    resumo: 'Abre vários .docx de uma vez, empilhados para conferir',
    descricao:
      'Arraste 3 ou 300 arquivos: eles aparecem um abaixo do outro, com índice lateral, sem abrir ' +
      'o Word trinta vezes. Serve para conferir os certificados recém-gerados de uma passada só.',
    url: 'https://visualizador-documentos.vercel.app',
    estado: 'ativa',
    // Folhas empilhadas — o mesmo desenho do favicon dela (PADRAO-FAVICON.md §3.3).
    icone: Files,
    tags: ['docx', 'conferência', 'leitura'],
    privacidade: 'local',
  },
]

/** §4.3 — clicável é o que tem endereço. Um só lugar decide isso. */
export function ehClicavel(ferramenta: Ferramenta): ferramenta is Ferramenta & { url: string } {
  return typeof ferramenta.url === 'string' && ferramenta.url.length > 0
}

/** §5.4 — a busca aparece a partir de um número de ferramentas *ativas*. */
export function ferramentasAtivas(ferramentas: Ferramenta[] = FERRAMENTAS): Ferramenta[] {
  return ferramentas.filter((f) => f.estado === 'ativa')
}

/** §6.1 — o `select` do formulário lista o catálogo pelo `id`. */
export function acharFerramenta(id: string): Ferramenta | undefined {
  return FERRAMENTAS.find((f) => f.id === id)
}
