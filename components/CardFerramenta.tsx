import { ArrowUpRight, CalendarClock, ExternalLink, FlaskConical, Hammer, Lock } from 'lucide-react'

import { ehClicavel, type EstadoFerramenta, type Ferramenta } from '@/lib/ferramentas'
import { cn } from '@/lib/utils'

/**
 * §5.3 — o card do catálogo.
 *
 * **Server Component, e é para continuar assim.** Ele não tem estado, não tem
 * evento e não precisa de JavaScript nenhum no navegador — é isso que faz o
 * catálogo aparecer instantaneamente e continuar aparecendo mesmo que o JS
 * falhe (§14). Se um dia alguém precisar pôr `'use client'` aqui, a mudança
 * merece pergunta antes.
 */

/** §4.3 — o selo de estado. `ativa` não tem selo: é o caso normal. */
const SELO_DE_ESTADO: Record<
  Exclude<EstadoFerramenta, 'ativa'>,
  { texto: string; icone: typeof FlaskConical; classe: string }
> = {
  beta: {
    texto: 'em teste',
    icone: FlaskConical,
    // Âmbar: avisa que pode ter defeito ANTES de a pessoa depender do resultado.
    classe: 'border-aviso/25 bg-aviso-50 text-aviso',
  },
  construcao: {
    texto: 'em construção',
    icone: Hammer,
    classe: 'border-cinza-200 bg-cinza-100 text-cinza-600',
  },
  planejada: {
    texto: 'planejada',
    icone: CalendarClock,
    classe: 'border-cinza-200 bg-cinza-100 text-cinza-600',
  },
}

function SeloEstado({ estado }: { estado: EstadoFerramenta }) {
  if (estado === 'ativa') return null

  const { texto, icone: Icone, classe } = SELO_DE_ESTADO[estado]

  // §9 — cor nunca é o único sinal: ícone + texto, sempre.
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        classe,
      )}
    >
      <Icone className="size-3" aria-hidden />
      {texto}
    </span>
  )
}

/**
 * §4.1 — `privacidade` é a informação mais valiosa que o hub carrega: quem
 * confia nela usa a ferramenta com a lista de verdade, em vez de com dados de
 * mentira.
 */
function SeloPrivacidade({ privacidade }: { privacidade: Ferramenta['privacidade'] }) {
  if (privacidade === 'local') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sucesso">
        <Lock className="size-3.5" aria-hidden />
        Fica no seu navegador
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cinza-500">
      <ArrowUpRight className="size-3.5" aria-hidden />
      Passa por um servidor
    </span>
  )
}

function Conteudo({ ferramenta }: { ferramenta: Ferramenta }) {
  const { icone: Icone } = ferramenta

  return (
    <>
      <div className="flex items-start gap-2.5">
        <Icone className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden />
        <h3 className="text-[18px] font-medium leading-snug text-cinza-900">{ferramenta.nome}</h3>
        <div className="ml-auto pl-2">
          <SeloEstado estado={ferramenta.estado} />
        </div>
      </div>

      <p className="mt-3 text-sm text-cinza-900">{ferramenta.resumo}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-cinza-500">{ferramenta.descricao}</p>

      {/* O selo de privacidade fica colado no rodapé do card, para que cards de
          alturas diferentes o alinhem na mesma linha. */}
      <div className="mt-auto pt-4">
        <SeloPrivacidade privacidade={ferramenta.privacidade} />
      </div>
    </>
  )
}

export function CardFerramenta({ ferramenta }: { ferramenta: Ferramenta }) {
  const base =
    'relative flex h-full flex-col rounded-[10px] border border-cinza-200 bg-white p-6'

  /**
   * §4.3 — card não clicável é **bloco inerte, não link desabilitado**: sem
   * `<a>`, sem `cursor: pointer`, sem `aria-disabled`. Link que não leva a
   * lugar nenhum é pior que ausência de link.
   */
  if (!ehClicavel(ferramenta)) {
    return (
      <div className={base}>
        <Conteudo ferramenta={ferramenta} />
      </div>
    )
  }

  return (
    <a
      href={ferramenta.url}
      target="_blank"
      /**
       * §5.3 — `noopener` é obrigatório: sem ele a página aberta recebe
       * `window.opener` e pode mexer nesta.
       */
      rel="noopener noreferrer"
      aria-label={`${ferramenta.nome}: ${ferramenta.resumo} (abre em nova aba)`}
      className={cn(
        base,
        // §5.3 — hover discreto: borda e fundo. Sem elevar, sem escalar, sem sombra.
        'transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
      )}
    >
      <Conteudo ferramenta={ferramenta} />
      {/* O ícone de link externo é o que diz, na tela, que a ferramenta abre em
          nova aba — o `aria-label` diz o mesmo para quem não vê o ícone. */}
      <ExternalLink
        className="absolute bottom-5 right-5 size-3.5 text-cinza-500"
        aria-hidden
      />
    </a>
  )
}
