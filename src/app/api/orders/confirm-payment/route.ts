import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/redis'
import { processOrderFulfillment } from '@/lib/order-fulfillment'

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
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Idempotency: Only process if order is still PENDING_PAYMENT
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ success: true, status: order.status })
    }

    // SECURITY: Always verify payment status server-side with Midtrans — never trust client blindly
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

    // Transition status to PAYMENT_CONFIRMED atomically
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAYMENT_CONFIRMED',
        paidAt: new Date(),
      },
    })

    // Trigger centralized order fulfillment
    await processOrderFulfillment(order.orderNumber)

    return NextResponse.json({ success: true, status: 'PAYMENT_CONFIRMED' })
  } catch (error: any) {
    console.error('[CONFIRM_PAYMENT_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal konfirmasi pembayaran' }, { status: 500 })
  }
}
