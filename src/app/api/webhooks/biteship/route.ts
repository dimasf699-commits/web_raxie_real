import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET() {
  return NextResponse.json({ ok: true, message: 'Biteship webhook endpoint active' }, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    // ── SECURITY CHECK ────────────────────────────────────────────────────────
    const webhookSecret = process.env.BITESHIP_WEBHOOK_SECRET || process.env.BITESHIP_API_KEY
    if (webhookSecret) {
      const authHeader = req.headers.get('authorization') || req.headers.get('x-biteship-signature') || req.headers.get('x-webhook-secret')
      const urlToken = req.nextUrl.searchParams.get('token')
      
      const isHeaderValid = authHeader && (authHeader === webhookSecret || authHeader === `Bearer ${webhookSecret}`)
      const isTokenValid = urlToken && urlToken === webhookSecret

      if (!isHeaderValid && !isTokenValid) {
        console.warn('[BITESHIP_WEBHOOK] Unauthorized webhook attempt:', {
          ip: req.ip || req.headers.get('x-forwarded-for'),
        })
        return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    let data: any = {}
    try {
      data = await req.json()
    } catch {
      // Empty or non-JSON body ping from Biteship validation
      return NextResponse.json({ ok: true, message: 'Ping OK' }, { status: 200 })
    }

    // Biteship webhook payload structure
    const { order_id, status, courier, waybill_id, id } = data || {}
    const targetOrderId = order_id || id || data.courier?.waybill_id

    if (targetOrderId) {
      let newStatus: OrderStatus | undefined = undefined

      switch (status?.toLowerCase()) {
        case 'allocated':
        case 'picking_up':
          newStatus = 'PROCESSING'
          break
        case 'picked':
        case 'dropping_off':
          newStatus = 'SHIPPED'
          break
        case 'delivered':
          newStatus = 'DELIVERED'
          break
        case 'rejected':
        case 'cancelled':
          newStatus = 'CANCELLED'
          break
        case 'returned':
          newStatus = 'RETURNED'
          break
      }

      // Find order by shippingOrderId or orderNumber or shippingWaybill
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { shippingOrderId: targetOrderId },
            { orderNumber: targetOrderId },
            { shippingWaybill: waybill_id || targetOrderId },
            { trackingNumber: waybill_id || targetOrderId },
          ],
        },
      })

      if (order) {
        const updateData: any = {
          shippingWaybill: waybill_id || order.shippingWaybill,
          trackingNumber: waybill_id || order.trackingNumber,
        }

        if (newStatus) {
          updateData.status = newStatus
          if (newStatus === 'SHIPPED' && !order.shippedAt) updateData.shippedAt = new Date()
          if (newStatus === 'DELIVERED' && !order.deliveredAt) updateData.deliveredAt = new Date()
        }

        await prisma.order.update({
          where: { id: order.id },
          data: updateData,
        })

        if (newStatus) {
          await prisma.orderTracking.create({
            data: {
              orderId: order.id,
              status: newStatus,
              description: `Status pengiriman: ${status} oleh ${courier?.company || 'Kurir'}`,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true, ok: true }, { status: 200 })
  } catch (error) {
    console.error('[BITESHIP_WEBHOOK_ERROR]', error)
    return NextResponse.json({ success: true, ok: true }, { status: 200 })
  }
}
