import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'white', borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', fontWeight: 900, color: '#2563eb',
          }}>S</div>
          <span style={{ color: 'white', fontSize: '48px', fontWeight: 800 }}>StayDirect</span>
        </div>
        <div style={{ color: 'white', fontSize: '36px', fontWeight: 700, textAlign: 'center', maxWidth: '900px', lineHeight: 1.3 }}>
          Réservations directes sans commission
        </div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '22px', marginTop: '20px', textAlign: 'center', maxWidth: '700px' }}>
          Créez votre site de réservation en 5 minutes · Économisez 3 000€/an
        </div>
        <div style={{
          marginTop: '48px', background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50px', padding: '12px 32px',
          color: 'white', fontSize: '18px', fontWeight: 600,
        }}>
          staydirect.fr
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
