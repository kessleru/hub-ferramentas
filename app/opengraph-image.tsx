import { ImageResponse } from 'next/og'

import { FERRAMENTAS } from '@/lib/ferramentas'

/**
 * §9.1 — o hub vai ser colado em conversa, então o *preview* faz parte do
 * produto. Um link sem preview parece link suspeito, e é a primeira impressão
 * de quem nunca ouviu falar das ferramentas.
 *
 * Gerada no build, com os mesmos tokens do §9 — mas escritos à mão aqui, porque
 * o gerador de imagem não enxerga o CSS da página.
 */
export const alt = 'Ferramentas — conjunto de ferramentas utilitárias internas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BRAND_700 = '#1d4ed8'
const CINZA_50 = '#f8fafc'
const CINZA_200 = '#e2e8f0'
const CINZA_500 = '#64748b'
const CINZA_900 = '#0f172a'

export default async function Imagem() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: CINZA_50,
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: BRAND_700,
              }}
            />
            <div style={{ fontSize: 60, fontWeight: 700, color: CINZA_900 }}>Ferramentas</div>
          </div>

          <div style={{ marginTop: 20, fontSize: 30, color: CINZA_500 }}>
            Conjunto de ferramentas utilitárias internas
          </div>
        </div>

        {/* Os nomes de verdade, lidos do catálogo: o preview envelhece junto com
            o §4 em vez de virar uma frase antiga colada aqui. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FERRAMENTAS.slice(0, 3).map((ferramenta) => (
            <div
              key={ferramenta.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 28,
                color: CINZA_900,
                backgroundColor: '#ffffff',
                border: `1px solid ${CINZA_200}`,
                borderRadius: 10,
                padding: '16px 22px',
              }}
            >
              <div
                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND_700 }}
              />
              {ferramenta.nome}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
