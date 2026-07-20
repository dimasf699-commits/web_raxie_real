import { NextRequest, NextResponse } from 'next/server'
import { getBiteshipRates } from '@/lib/biteship'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { destination_area_id, weight, items } = body

    if (!destination_area_id) {
      return NextResponse.json({ error: 'Tujuan pengiriman tidak valid' }, { status: 400 })
    }

    // Origin is hardcoded to Raxie Warehouse Area ID for now
    // NOTE: This must be replaced with the actual Area ID of the store
    const ORIGIN_AREA_ID = process.env.STORE_AREA_ID || 'IDNP10C110DZ3338' // Example Area ID (e.g., Jakarta Selatan)

    const ratesData = await getBiteshipRates({
      origin_area_id: ORIGIN_AREA_ID,
      destination_area_id,
      weight,
      items
    })

    // Map Biteship rates to our format
    const rates = ratesData.map((rate: any) => ({
      id: `${rate.company}_${rate.courier_service_code}`,
      name: rate.courier_service_name,
      courier: rate.company.toUpperCase(),
      price: rate.price,
      estimated: rate.estimated_delivery_time || 'Reguler'
    }))

    // Sort by price
    rates.sort((a: any, b: any) => a.price - b.price)

    return NextResponse.json({ rates })
  } catch (error) {
    console.error('[SHIPPING_API_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mendapatkan tarif pengiriman' }, { status: 500 })
  }
}
