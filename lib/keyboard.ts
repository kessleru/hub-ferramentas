/**
 * §5.5 — o mesmo `ehEntradaDeTexto` do `lib/keyboard.ts` do gerador.
 *
 * Serve para um atalho de tecla solta (o `/` da busca) não disparar enquanto a
 * pessoa está escrevendo — do contrário, digitar uma barra na descrição de um
 * defeito rouba o foco para o campo de busca.
 */
export function ehEntradaDeTexto(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false

  if (alvo.isContentEditable) return true

  const tag = alvo.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true

  if (tag === 'INPUT') {
    const tipo = (alvo as HTMLInputElement).type
    // Caixas de marcar e botões não recebem texto: neles o atalho pode valer.
    return tipo !== 'checkbox' && tipo !== 'radio' && tipo !== 'button' && tipo !== 'submit'
  }

  return false
}
