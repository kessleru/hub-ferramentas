'use server'

import { Resend } from 'resend'

import type { EstadoDoEnvio } from '@/app/acoes/estado'
import { contemDadoPessoal, MENSAGEM_DADO_PESSOAL } from '@/lib/dadoPessoal'
import { montarEmail } from '@/lib/email'
import { TEMPO_MINIMO_MS } from '@/lib/limites'
import { gerarProtocolo } from '@/lib/protocolo'
import { lerFormData, MENSAGEM_DO_CAMPO, solicitacaoSchema } from '@/lib/solicitacao'

/**
 * §7 — O SERVIDOR. Uma ação, e só: mandar o e-mail.
 *
 * Cinco regras de dentro dela (§7.2):
 *
 * 1. **A ação é a fronteira de confiança.** Server Action é um endpoint público
 *    com outro nome: qualquer um pode chamá-la com o corpo que quiser. Tudo que
 *    o §6 valida na tela é validado aqui de novo, sem exceção.
 * 2. **A resposta nunca ecoa o que chegou.**
 * 3. **Erro do provedor não vaza para a tela.**
 * 4. **Nada é guardado.** Sem banco, sem log do conteúdo da mensagem. A caixa
 *    de entrada é o arquivo — e o que não é guardado não vaza.
 * 5. **O formulário funciona sem JavaScript.**
 */

/**
 * §7.3 — sem as variáveis, a ação falha **na primeira linha, com mensagem
 * clara**, e não no meio do envio.
 *
 * Nenhuma delas pode ser prefixada com `NEXT_PUBLIC_`: o Next embute no bundle
 * tudo que começa assim, e a chave iria para o navegador de quem abrir a
 * página.
 */
function lerVariaveis() {
  const faltando = ['RESEND_API_KEY', 'EMAIL_DESTINO', 'EMAIL_REMETENTE'].filter(
    (nome) => !process.env[nome],
  )

  if (faltando.length > 0) {
    throw new Error(`falta ${faltando.join(', ')} — configure em .env.local ou na Vercel (§7.3)`)
  }

  return {
    chave: process.env.RESEND_API_KEY!,
    destino: process.env.EMAIL_DESTINO!,
    remetente: process.env.EMAIL_REMETENTE!,
  }
}

/**
 * §7.5 — robô preencheu o honeypot, ou enviou rápido demais.
 *
 * **Sucesso com protocolo falso, sem enviar nada.** Devolver erro ensina o robô
 * a tentar de novo; devolver sucesso o faz seguir a vida achando que funcionou.
 */
function pareceRobo(dados: FormData): boolean {
  const honeypot = dados.get('site')
  if (typeof honeypot === 'string' && honeypot.trim() !== '') return true

  const montadoEm = Number(dados.get('montadoEm'))
  // Ausente ou ilegível é o envio sem JavaScript (§7.2): não dá para julgar, e
  // recusar aqui quebraria justamente quem está sem JS.
  if (Number.isFinite(montadoEm) && montadoEm > 0) {
    if (Date.now() - montadoEm < TEMPO_MINIMO_MS) return true
  }

  return false
}

export async function enviarSolicitacao(
  _estado: EstadoDoEnvio,
  dados: FormData,
): Promise<EstadoDoEnvio> {
  // 2. §7.5 — antes do schema, porque o honeypot preenchido reprova no schema
  //    (§6.6) e a resposta de campo inválido contaria ao robô o que corrigir.
  if (pareceRobo(dados)) {
    return { situacao: 'enviado', protocolo: gerarProtocolo() }
  }

  // 1. §6.6 — o mesmo schema da tela. Recusa devolve o campo, não uma frase
  //    genérica.
  const lido = solicitacaoSchema.safeParse(lerFormData(dados))

  if (!lido.success) {
    const campos: Record<string, string> = {}
    for (const problema of lido.error.issues) {
      const campo = String(problema.path[0])
      campos[campo] ??= MENSAGEM_DO_CAMPO[campo] ?? 'Confira este campo.'
    }
    return { situacao: 'invalido', campos }
  }

  const solicitacao = lido.data

  // 3. §7.6 — a checagem de dado pessoal também é do servidor. O cliente é
  //    opcional (dá para chamar a ação direto), e promessa que só o formulário
  //    sustenta não é promessa.
  const achado = contemDadoPessoal(solicitacao.descricao)
  if (achado.encontrou) {
    return { situacao: 'dado-pessoal', mensagem: MENSAGEM_DADO_PESSOAL[achado.motivo!] }
  }

  // 4. §7.4 — o protocolo, que vai no assunto, no corpo e na tela.
  const protocolo = gerarProtocolo()

  try {
    const { chave, destino, remetente } = lerVariaveis()
    const { assunto, texto } = montarEmail(solicitacao, protocolo)

    const resend = new Resend(chave)
    const resposta = await resend.emails.send({
      from: remetente,
      to: destino,
      subject: assunto,
      text: texto,
      /**
       * §7.4 — **a peça que fecha o ciclo.** O remetente é fixo (tem que ser do
       * domínio verificado), mas responder o e-mail responde para quem pediu,
       * sem copiar endereço à mão.
       */
      replyTo: `${solicitacao.nome} <${solicitacao.email}>`,
    })

    if (resposta.error) {
      // §7.2 — o detalhe fica no log; para a pessoa, o §6.8.
      console.error('[solicitar] provedor recusou:', resposta.error)
      return { situacao: 'erro' }
    }
  } catch (erro) {
    console.error('[solicitar] não consegui enviar:', erro)
    return { situacao: 'erro' }
  }

  // 6. §6.7 — só o protocolo volta.
  return { situacao: 'enviado', protocolo }
}

/**
 * §6.8 — o endereço de destino para o `mailto:` de emergência.
 *
 * Existe como ação separada porque o §7.3 mantém esse endereço **fora do
 * bundle**: endereço em HTML é endereço coletado por robô. A tela só chama isto
 * **depois** de uma falha de envio, que é quando a saída de emergência importa.
 */
export async function enderecoDeContato(): Promise<string> {
  return process.env.EMAIL_DESTINO ?? ''
}
