import { z } from 'zod'

import { MAX_ASSUNTO, MAX_DESCRICAO } from '@/lib/limites'

/**
 * §6.6 — **o schema é um só**, importado pelo formulário e pela Server Action.
 *
 * Dois schemas é a receita de aceitar no navegador o que o servidor recusa, e
 * a pessoa fica olhando um erro genérico sem saber qual campo consertar.
 */

export const TIPOS = ['defeito', 'melhoria', 'ferramenta', 'duvida'] as const
export type TipoSolicitacao = (typeof TIPOS)[number]

/** §6.1 — o rótulo de cada tipo na tela e no assunto do e-mail (§7.4). */
export const ROTULO_DO_TIPO: Record<TipoSolicitacao, string> = {
  defeito: 'defeito',
  melhoria: 'melhoria',
  ferramenta: 'ferramenta nova',
  duvida: 'dúvida',
}

/** §6.1 — "outra / nenhuma" é uma opção de verdade do `select`. */
export const SEM_FERRAMENTA = 'outra'

/**
 * §6.4 — o contexto que segue junto da mensagem. A pessoa vê exatamente isto
 * num bloco recolhido antes de enviar.
 */
const contextoSchema = z.object({
  userAgent: z.string().max(400),
  tela: z.string().max(40),
  idioma: z.string().max(20),
  enviadoEm: z.string().max(40),
})

export const solicitacaoSchema = z.object({
  tipo: z.enum(TIPOS),
  ferramentaId: z.string().min(1).max(64),
  assunto: z.string().trim().min(5).max(MAX_ASSUNTO),
  descricao: z.string().trim().min(20).max(MAX_DESCRICAO),
  nome: z.string().trim().min(2).max(120),
  email: z.email().max(180),
  /**
   * Opcional de propósito: §7.2 exige que o formulário funcione com o
   * JavaScript desligado, e sem JS não há `navigator` para montar o contexto.
   * O que se perde é o contexto, não o envio.
   */
  contexto: contextoSchema.optional(),
  /** honeypot: sempre vazio para gente de verdade (§7.5) */
  site: z.string().max(0).optional(),
})

export type Solicitacao = z.infer<typeof solicitacaoSchema>
export type Contexto = z.infer<typeof contextoSchema>

/**
 * §6.6 — os `max` não são decoração: são o que impede alguém de mandar 4 MB de
 * texto pelo servidor (§7.5).
 */

/** As mensagens que a tela mostra por campo. Português, e dizendo o que fazer. */
export const MENSAGEM_DO_CAMPO: Record<string, string> = {
  tipo: 'Escolha o tipo da solicitação.',
  ferramentaId: 'Escolha a ferramenta.',
  assunto: `Escreva um assunto com pelo menos 5 caracteres (no máximo ${MAX_ASSUNTO}).`,
  descricao: `Conte o que aconteceu, com pelo menos 20 caracteres (no máximo ${MAX_DESCRICAO}).`,
  nome: 'Diga seu nome.',
  email: 'Escreva um e-mail válido — é para lá que vai a resposta.',
}

/**
 * Converte o `FormData` do `<form>` no objeto do schema. Fica aqui, e não na
 * ação, porque o teste do §11 monta `FormData` à mão e precisa da mesma leitura.
 */
export function lerFormData(dados: FormData): unknown {
  const contextoBruto = dados.get('contexto')

  let contexto: unknown
  if (typeof contextoBruto === 'string' && contextoBruto !== '') {
    try {
      contexto = JSON.parse(contextoBruto)
    } catch {
      // Contexto ilegível é contexto ausente: ele é conveniência, não requisito.
      contexto = undefined
    }
  }

  return {
    tipo: dados.get('tipo') ?? undefined,
    ferramentaId: dados.get('ferramentaId') ?? undefined,
    assunto: dados.get('assunto') ?? undefined,
    descricao: dados.get('descricao') ?? undefined,
    nome: dados.get('nome') ?? undefined,
    email: dados.get('email') ?? undefined,
    contexto,
    site: dados.get('site') ?? undefined,
  }
}
