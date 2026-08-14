import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Raxie — Premium Leather Wallets & Accessories'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a0f0a',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: '#C19A6B',
            letterSpacing: '20px',
            marginBottom: '20px',
          }}
        >
          RAXIE
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#8a7560',
            letterSpacing: '8px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          PREMIUM LEATHER WALLETS & ACCESSORIES
        </div>
        <div
          style={{
            width: '300px',
            height: '1px',
            backgroundColor: '#C19A6B',
            opacity: 0.4,
            marginTop: '40px',
            marginBottom: '20px',
          }}
        />
        <div
          style={{
            fontSize: 18,
            color: '#6b5c4d',
            letterSpacing: '4px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          raxie.id
        </div>
      </div>
    ),
    { ...size }
  )
}
