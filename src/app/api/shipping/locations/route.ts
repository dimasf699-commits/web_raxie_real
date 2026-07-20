import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 3) {
      return NextResponse.json({ locations: [] })
    }

    const apiKey = process.env.BITESHIP_API_KEY
    console.log('[SHIPPING] API Key exists:', !!apiKey)
    console.log('[SHIPPING] Query:', query)

    if (!apiKey) {
      console.error('[SHIPPING] BITESHIP_API_KEY is not set!')
      return NextResponse.json({ locations: [], error: 'API key missing' })
    }

    const url = `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(query)}&type=single`
    console.log('[SHIPPING] Fetching:', url)

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    console.log('[SHIPPING] Response status:', res.status)

    if (!res.ok) {
      const errText = await res.text()
      console.error('[SHIPPING] Biteship error:', errText)
      return NextResponse.json({ locations: [], error: `Biteship error: ${res.status}` })
    }

    const data = await res.json()
    console.log('[SHIPPING] Areas count:', data.areas?.length || 0)
    return NextResponse.json({ locations: data.areas || [] })
  } catch (error) {
    console.error('[SHIPPING_LOCATIONS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch locations', locations: [] }, { status: 500 })
  }
}
