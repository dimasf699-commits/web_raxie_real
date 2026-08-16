import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { processOrderFulfillment } from '@/lib/order-fulfillment'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // SECURITY: Validate signature key strictly
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error('[MIDTRANS_WEBHOOK_ERROR] MIDTRANS_SERVER_KEY is not configured on server.')
      return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 500 })
    }

    if (!data.order_id || !data.status_code || !data.gross_amount || !data.signature_key) {
      return NextResponse.json({ error: 'Missing required webhook payload fields' }, { status: 400 })
    }

    const sigRaw = `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`
    const expectedSig1 = crypto.createHash('sha512').update(sigRaw).digest('hex')

    const grossNum = Number(data.gross_amount)
    const sigFormatted = `${data.order_id}${data.status_code}${grossNum.toFixed(2)}${serverKey}`
    const expectedSig2 = crypto.createHash('sha512').update(sigFormatted).digest('hex')

    const isValidSignature = (expectedSig1 === data.signature_key || expectedSig2 === data.signature_key)

    if (!isValidSignature) {
      console.warn('[MIDTRANS_WEBHOOK] Signature mismatch:', { received: data.signature_key, sigRaw })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { transaction_status, fraud_status, order_id } = data

    // Map Midtrans status to our Prisma OrderStatus
    let newStatus = undefined
    let paidAt = undefined
    let shouldFulfill = false

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newStatus = 'PAYMENT_CONFIRMED'
        paidAt = new Date()
        shouldFulfill = true
      }
    } else if (transaction_status === 'settlement') {
      newStatus = 'PAYMENT_CONFIRMED'
      paidAt = new Date()
      shouldFulfill = true
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'CANCELLED'
    } else if (transaction_status === 'pending') {
      newStatus = 'PENDING_PAYMENT'
    }

    if (newStatus) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: order_id },
        include: { items: true },
      })

      if (!existingOrder) {
        console.warn(`[MIDTRANS_WEBHOOK] Order ${order_id} not found in database.`)
        return NextResponse.json({ message: 'Order not found, acknowledged' }, { status: 200 })
      }

      // Idempotency check: Only trigger fulfillment if transitioning from PENDING_PAYMENT
      const isFirstPaymentConfirmation = shouldFulfill && existingOrder.status === 'PENDING_PAYMENT'
      const isCancellation = newStatus === 'CANCELLED' && existingOrder.status === 'PENDING_PAYMENT'

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { orderNumber: order_id },
          data: { 
            status: newStatus as any,
            ...(paidAt && !existingOrder.paidAt ? { paidAt } : {}),
            ...(isCancellation ? { cancelledAt: new Date() } : {})
          },
        })

        // Restore reserved stock & voucher if cancelled
        if (isCancellation) {
          for (const item of existingOrder.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              }).catch((e) => console.error('[RESTORE_STOCK_ERROR]', e))
            }
          }
          if (existingOrder.voucherId) {
            await tx.voucher.update({
              where: { id: existingOrder.voucherId },
              data: { usageCount: { decrement: 1 } },
            }).catch(() => {})
          }
        }
      })

      // If paid for the first time, trigger centralized order fulfillment
      if (isFirstPaymentConfirmation) {
        await processOrderFulfillment(existingOrder.orderNumber)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[MIDTRANS_WEBHOOK_ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
