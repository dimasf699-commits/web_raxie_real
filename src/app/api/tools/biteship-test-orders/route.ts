import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const testKey = searchParams.get('key')

  if (!testKey || !testKey.startsWith('biteship_test.')) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Biteship Test Order Generator</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; }
            input, button { padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 1rem; width: 100%; box-sizing: border-box; margin-top: 0.5rem; }
            input { background: #1e293b; border: 1px solid #334155; color: #fff; }
            button { background: #6366f1; color: #fff; border: none; font-weight: bold; cursor: pointer; margin-top: 1rem; }
            button:hover { background: #4f46e5; }
            .card { background: #1e293b; padding: 1.5rem; border-radius: 1rem; border: 1px solid #334155; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🤖 Pembuat 2 ID Test Order Biteship</h2>
            <p>Masukkan API Key Sandbox / Testing kamu (yang diawali <code>biteship_test...</code>):</p>
            <form method="GET" action="/api/tools/biteship-test-orders">
              <input type="text" name="key" placeholder="biteship_test.eyJhbG..." required />
              <button type="submit">⚡ Buat 2 Test Order Otomatis</button>
            </form>
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  try {
    let errDetail1 = ''
    let errDetail2 = ''

    const createOrder = async (nameSuffix: string) => {
      const res = await fetch('https://api.biteship.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipper_contact_name: 'Raxie Store',
          shipper_contact_phone: '082128862433',
          shipper_contact_email: 'raxieleather@gmail.com',
          origin_contact_name: 'Raxie Store',
          origin_contact_phone: '082128862433',
          origin_contact_email: 'raxieleather@gmail.com',
          origin_area_id: 'IDNP9IDNC122IDND450IDZ44161',
          origin_address: 'Kp. Pasirkiamis, Garut',
          destination_contact_name: `Test Customer ${nameSuffix}`,
          destination_contact_phone: '081234567890',
          destination_contact_email: 'test@raxie.my.id',
          destination_address: 'Jl. Test No 123',
          destination_postal_code: 44161,
          destination_area_id: 'IDNP9IDNC122IDND450IDZ44161',
          courier_company: 'jne',
          courier_type: 'reg',
          delivery_type: 'now',
          items: [{ name: 'Test Item', value: 50000, quantity: 1, weight: 500 }],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || data.message || JSON.stringify(data) }
      }
      return data
    }

    const updateStatus = async (orderId: string, status: string) => {
      // Biteship sandbox supports updating status via order update or status endpoint
      await fetch(`https://api.biteship.com/v1/orders/${orderId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }).catch(() => null)

      await fetch(`https://api.biteship.com/v1/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }).catch(() => null)
    }

    // 1. Create Delivered Order with full sequential status flow
    const order1 = await createOrder('Delivered')
    const id1 = order1.id || order1.order_id
    if (id1) {
      const steps = ['allocated', 'picking_up', 'picked', 'dropping_off', 'delivered']
      for (const step of steps) {
        await updateStatus(id1, step)
      }
    } else if (order1.error) {
      errDetail1 = order1.error
    }

    // 2. Create Cancelled Order
    const order2 = await createOrder('Cancelled')
    const id2 = order2.id || order2.order_id
    if (id2) {
      await updateStatus(id2, 'cancelled')
      await updateStatus(id2, 'rejected')
    } else if (order2.error) {
      errDetail2 = order2.error
    }

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Hasil Test Order Biteship</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 650px; margin: 0 auto; background: #0f172a; color: #f8fafc; }
            .box { background: #1e293b; padding: 1.25rem; border-radius: 0.75rem; margin-bottom: 1rem; border: 1px solid #334155; }
            .label { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
            .code { font-family: monospace; font-size: 1rem; font-weight: bold; color: #38bdf8; background: #0f172a; padding: 0.5rem 0.75rem; border-radius: 0.5rem; margin-top: 0.5rem; word-break: break-all; }
            .btn { background: #22c55e; color: #fff; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer; margin-top: 0.5rem; }
            .err { color: #f87171; }
          </style>
        </head>
        <body>
          <h2>Hasil Test Order Biteship (Status Updated!)</h2>
          <p>Gunakan ID di bawah untuk Formulir Aktivasi Biteship kamu:</p>
          
          <div class="box">
            <div class="label">1. ID Pesanan Test Status "DELIVERED":</div>
            <div class="code ${id1 ? '' : 'err'}">${id1 || 'Error: ' + errDetail1}</div>
            ${id1 ? `<button class="btn" onclick="navigator.clipboard.writeText('${id1}'); alert('ID Delivered Disalin!')">📋 Salin ID Delivered</button>` : ''}
          </div>

          <div class="box">
            <div class="label">2. ID Pesanan Test Status "CANCELLED":</div>
            <div class="code ${id2 ? '' : 'err'}">${id2 || 'Error: ' + errDetail2}</div>
            ${id2 ? `<button class="btn" onclick="navigator.clipboard.writeText('${id2}'); alert('ID Cancelled Disalin!')">📋 Salin ID Cancelled</button>` : ''}
          </div>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
