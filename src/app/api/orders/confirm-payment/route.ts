import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBiteshipOrder } from '@/lib/biteship'
import { rateLimit } from '@/lib/redis'
import { sendOrderEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`confirm_payment:${clientIp}`, 10, 60)
    if (!limit.success) {
      return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 })
    }

    const { orderNumber } = await req.json()
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, user: { select: { email: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Idempotency: Only process if order is still PENDING_PAYMENT
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ success: true, status: order.status })
    }

    // SECURITY: Always verify payment status server-side with Midtrans — never trust client
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json(
        { error: 'Konfigurasi pembayaran belum lengkap di server' },
        { status: 500 }
      )
    }

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const statusApiUrl = isProduction
      ? `https://api.midtrans.com/v2/${orderNumber}/status`
      : `https://api.sandbox.midtrans.com/v2/${orderNumber}/status`

    let isPaid = false

    try {
      const authString = Buffer.from(serverKey + ':').toString('base64')
      const res = await fetch(statusApiUrl, {
        headers: {
          Authorization: `Basic ${authString}`,
          Accept: 'application/json',
        },
      })
      if (res.ok) {
        const midtransData = await res.json()
        const status = midtransData.transaction_status
        if (status === 'settlement' || (status === 'capture' && midtransData.fraud_status === 'accept')) {
          isPaid = true
        }
      }
    } catch (err) {
      console.error('[MIDTRANS_STATUS_CHECK_ERROR]', err)
    }

    if (!isPaid) {
      // Payment not yet confirmed by Midtrans
      return NextResponse.json({ success: true, status: order.status })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAYMENT_CONFIRMED',
        paidAt: new Date(),
      },
      include: { items: true },
    })

    // Send order confirmation email
    const customerEmail = order.user?.email || updatedOrder.guestEmail || order.guestEmail
    if (customerEmail) {
      sendOrderEmail(customerEmail, updatedOrder.orderNumber, updatedOrder.totalAmount).catch(console.error)
    }

    // Trigger Biteship shipping creation if not already created
    if (!updatedOrder.shippingOrderId && updatedOrder.shippingStreet) {
      try {
        const STORE_AREA_ID = process.env.STORE_AREA_ID || 'IDNP9IDNC122IDND450IDZ44161'
        let company = 'jne'
        if (updatedOrder.courierName) {
          company = updatedOrder.courierName.toLowerCase().includes('j&t') ? 'jnt' :
                    updatedOrder.courierName.toLowerCase().includes('sicepat') ? 'sicepat' : 'jne'
        }

        const destinationAreaId = (updatedOrder.shippingCity && updatedOrder.shippingCity.startsWith('ID'))
          ? updatedOrder.shippingCity
          : 'IDNP9IDNC122IDND450IDZ44161'

        const biteshipOrderPayload = {
          origin_contact_name: "Raxie Store",
          origin_contact_phone: "082128862433",
          origin_contact_email: "raxieleather@gmail.com",
          shipper_contact_name: "Raxie Store",
          shipper_contact_phone: "082128862433",
          shipper_contact_email: "raxieleather@gmail.com",
          origin_area_id: STORE_AREA_ID,
          origin_address: "Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat",
          destination_contact_name: updatedOrder.shippingName,
          destination_contact_phone: updatedOrder.shippingPhone,
          destination_contact_email: updatedOrder.guestEmail || "customer@raxie.id",
          destination_address: updatedOrder.shippingStreet,
          destination_postal_code: Number(updatedOrder.shippingPostalCode) || 44161,
          destination_area_id: destinationAreaId,
          destination_note: "Mohon titipkan ke satpam jika tidak ada orang",
          courier_company: company,
          courier_type: 'reg',
          delivery_type: "now",
          items: updatedOrder.items.map(item => ({
            name: item.productName,
            description: item.variantName || item.productName,
            value: item.price,
            quantity: item.quantity,
            weight: 500
          }))
        }

        const shipment = await createBiteshipOrder(biteshipOrderPayload)
        if (shipment && (shipment.success || shipment.id)) {
          const waybill = shipment.courier?.waybill_id || shipment.id
          await prisma.order.update({
            where: { id: updatedOrder.id },
            data: {
              status: 'SHIPPED',
              shippingOrderId: shipment.id || shipment.order_id || null,
              shippingWaybill: waybill,
              trackingNumber: waybill,
              shippedAt: new Date(),
            }
          })
        }
      } catch (shipErr) {
        console.error('[CONFIRM_PAYMENT_BITESHIP_ERROR]', shipErr)
      }
    }

    // Increment totalSold
    try {
      await Promise.all(
        updatedOrder.items.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { totalSold: { increment: item.quantity } }
          })
        )
      )
    } catch (err) {
      console.error('[UPDATE_TOTAL_SOLD_ERROR]', err)
    }

    return NextResponse.json({ success: true, status: 'PAYMENT_CONFIRMED' })
  } catch (error: any) {
    console.error('[CONFIRM_PAYMENT_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal konfirmasi pembayaran' }, { status: 500 })
  }
}
