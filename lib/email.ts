import { ROTULO_DO_CONTEXTO } from '@/lib/contexto'
import { acharFerramenta } from '@/lib/ferramentas'
import { ROTULO_DO_TIPO, SEM_FERRAMENTA, type Solicitacao } from '@/lib/solicitacao'

/**
 * §7.4 — o e-mail que chega. Puro e testável: montar texto não precisa de rede.
 *
 * Corpo em **texto puro** de propósito: sobrevive a qualquer cliente, não cai
 * em filtro por conter HTML, e é o que dá para colar num chamado.
 */

export interface EmailMontado {
  assunto: string
  texto: string
}

function nomeDaFerramenta(ferramentaId: string): string {
  if (ferramentaId === SEM_FERRAMENTA) return 'outra / nenhuma'
  return acharFerramenta(ferramentaId)?.nome ?? ferramentaId
}

/** `[defeito · Gerador de Certificados] Não gera quando o nome tem acento` */
export function montarAssunto(solicitacao: Solicitacao): string {
  const tipo = ROTULO_DO_TIPO[solicitacao.tipo]
  return `[${tipo} · ${nomeDaFerramenta(solicitacao.ferramentaId)}] ${solicitacao.assunto}`
}

export function montarEmail(solicitacao: Solicitacao, protocolo: string): EmailMontado {
  const linhas: string[] = [
    `Protocolo: ${protocolo}`,
    `Tipo: ${ROTULO_DO_TIPO[solicitacao.tipo]}`,
    `Ferramenta: ${nomeDaFerramenta(solicitacao.ferramentaId)}`,
    `Quem pediu: ${solicitacao.nome} <${solicitacao.email}>`,
    '',
    '---',
    '',
    // A descrição inteira, sem cortar. Cortar aqui é perder o relato.
    solicitacao.descricao,
    '',
    '---',
    '',
  ]

  // §6.4 — o contexto vai no fim, porque é apoio e não é o assunto.
  if (solicitacao.contexto) {
    linhas.push('Contexto enviado junto (§6.4):')
    for (const [chave, rotulo] of Object.entries(ROTULO_DO_CONTEXTO)) {
      linhas.push(`  ${rotulo}: ${solicitacao.contexto[chave as keyof typeof solicitacao.contexto]}`)
    }
  } else {
    // Sem JavaScript não há contexto (§7.2). Dizer isso vale mais que omitir.
    linhas.push('Contexto: não enviado (JavaScript desligado no navegador de quem pediu).')
  }

  return { assunto: montarAssunto(solicitacao), texto: linhas.join('\n') }
}

/**
 * §6.8 — a saída de emergência: um `mailto:` com assunto e corpo já
 * preenchidos, para o dia em que o envio não funcionar. Mesmo texto do e-mail
 * de verdade, para que a mensagem chegue igual pelos dois caminhos.
 */
export function montarMailto(
  destino: string,
  solicitacao: Solicitacao,
  protocolo: string,
): string {
  const { assunto, texto } = montarEmail(solicitacao, protocolo)
  return `mailto:${destino}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`
}
