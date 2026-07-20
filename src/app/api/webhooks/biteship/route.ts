import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Biteship webhook sends events for order status changes
    // Refer to https://biteship.com/docs/api/webhooks
    const { event, order_id, status, courier, waybill_id } = data

    if (event === 'order.status.updated' && order_id) {
      // Map Biteship status to Raxie OrderStatus
      let newStatus: OrderStatus | undefined = undefined

      switch (status) {
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

      if (newStatus) {
        // Find order by shippingOrderId
        const order = await prisma.order.findFirst({
          where: { shippingOrderId: order_id }
        })

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              status: newStatus,
              shippingWaybill: waybill_id || order.shippingWaybill,
              ...(newStatus === 'SHIPPED' && !order.shippedAt ? { shippedAt: new Date() } : {}),
              ...(newStatus === 'DELIVERED' && !order.deliveredAt ? { deliveredAt: new Date() } : {})
            }
          })

          // Add tracking history
          await prisma.orderTracking.create({
            data: {
              orderId: order.id,
              status: newStatus,
              description: `Status pengiriman: ${status} oleh ${courier?.company || 'Kurir'}`,
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[BITESHIP_WEBHOOK_ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
