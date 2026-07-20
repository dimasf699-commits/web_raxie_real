export const BITESHIP_API_URL = 'https://api.biteship.com/v1'
export const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY

export interface BiteshipLocation {
  id: string
  name: string
  country_name: string
  administrative_division_level_1_name: string // Province
  administrative_division_level_2_name: string // City
  administrative_division_level_3_name: string // District/Kecamatan
  postal_code: string
}

export interface BiteshipRate {
  company: string
  courier_name: string
  courier_service_name: string
  courier_service_code: string
  tier: string
  description: string
  service_type: string
  shipping_type: string
  price: number
  estimated_delivery_time: string
}

export async function getBiteshipLocations(query: string): Promise<BiteshipLocation[]> {
  if (!BITESHIP_API_KEY) {
    console.error('BITESHIP_API_KEY is missing')
    return []
  }

  try {
    const res = await fetch(`${BITESHIP_API_URL}/maps/areas?countries=ID&input=${encodeURIComponent(query)}&type=single`, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`
      }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch locations: ${res.statusText}`)
    }

    const data = await res.json()
    return data.areas || []
  } catch (error) {
    console.error('[BITESHIP_LOCATIONS_ERROR]', error)
    return []
  }
}

export async function getBiteshipRates({
  origin_area_id,
  destination_area_id,
  weight, // in grams
  items
}: {
  origin_area_id: string
  destination_area_id: string
  weight: number
  items: any[]
}): Promise<BiteshipRate[]> {
  if (!BITESHIP_API_KEY) {
    console.error('BITESHIP_API_KEY is missing')
    return []
  }

  try {
    const res = await fetch(`${BITESHIP_API_URL}/rates/couriers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin_area_id,
        destination_area_id,
        couriers: 'jne,jnt,sicepat,anteraja,paxel,ninja',
        items: items.map(item => ({
          name: item.name,
          value: item.price,
          quantity: item.quantity,
          weight: Math.max(Math.round(item.weight || 500), 1) // default 500g if missing
        }))
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Biteship rates failed:', errText)
      throw new Error(`Failed to fetch rates: ${res.statusText}`)
    }

    const data = await res.json()
    return data.pricing || []
  } catch (error) {
    console.error('[BITESHIP_RATES_ERROR]', error)
    return []
  }
}

export async function createBiteshipOrder(orderData: any) {
  if (!BITESHIP_API_KEY) {
    console.error('BITESHIP_API_KEY is missing')
    return null
  }

  try {
    const res = await fetch(`${BITESHIP_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Biteship order creation failed:', errText)
      throw new Error(`Failed to create Biteship order: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('[BITESHIP_CREATE_ORDER_ERROR]', error)
    return null
  }
}

export async function getBiteshipTracking(orderId: string) {
  if (!BITESHIP_API_KEY) {
    console.error('BITESHIP_API_KEY is missing')
    return null
  }

  try {
    const res = await fetch(`${BITESHIP_API_URL}/trackings/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`
      }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch tracking: ${res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('[BITESHIP_TRACKING_ERROR]', error)
    return null
  }
}
