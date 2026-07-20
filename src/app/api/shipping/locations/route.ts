import { NextRequest, NextResponse } from 'next/server'
import { getBiteshipLocations } from '@/lib/biteship'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 3) {
      return NextResponse.json({ locations: [] })
    }

    const locations = await getBiteshipLocations(query)
    return NextResponse.json({ locations })
  } catch (error) {
    console.error('[SHIPPING_LOCATIONS_ERROR]', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}
