import { getBiteshipRates } from './src/lib/biteship'
import dotenv from 'dotenv'

dotenv.config()

async function test() {
  console.log('Testing Biteship with STORE_AREA_ID:', process.env.STORE_AREA_ID)
  
  const rates = await getBiteshipRates({
    origin_area_id: process.env.STORE_AREA_ID || 'IDNP10C110DZ3338',
    destination_area_id: 'IDNP10C110DZ3338', // just a test destination
    weight: 500,
    items: [
      {
        name: 'Test Item',
        price: 100000,
        quantity: 1,
        weight: 500
      }
    ]
  })

  console.log('Result:', rates)
}

test()
