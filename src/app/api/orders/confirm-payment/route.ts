import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBiteshipOrder } from '@/lib/biteship'

export async function POST(req: NextRequest) {
  try {
    const { orderNumber } = await req.json()
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check with Midtrans status API if needed
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const statusApiUrl = isProduction
      ? `https://api.midtrans.com/v2/${orderNumber}/status`
      : `https://api.sandbox.midtrans.com/v2/${orderNumber}/status`

    let isPaid = false

    if (serverKey) {
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
    } else {
      // Fallback if serverKey not present in dev
      isPaid = true
    }

    if (isPaid && order.status === 'PENDING_PAYMENT') {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAYMENT_CONFIRMED',
          paidAt: new Date(),
        },
        include: { items: true },
      })

      // Trigger Biteship shipping creation if not already created
      if (!updatedOrder.shippingOrderId && updatedOrder.shippingStreet) {
        try {
          const STORE_AREA_ID = process.env.STORE_AREA_ID || 'IDNP9IDNC122IDND450IDZ44161'
          let company = 'jne'
          if (updatedOrder.courierName) {
            company = updatedOrder.courierName.toLowerCase().includes('j&t') ? 'jnt' :
                      updatedOrder.courierName.toLowerCase().includes('sicepat') ? 'sicepat' : 'jne'
          }

          const biteshipOrderPayload = {
            shipper_contact_name: "Raxie Store",
            shipper_contact_phone: "082128862433",
            origin_area_id: STORE_AREA_ID,
            destination_contact_name: updatedOrder.shippingName,
            destination_contact_phone: updatedOrder.shippingPhone,
            destination_contact_email: updatedOrder.guestEmail || "customer@raxie.my.id",
            destination_address: updatedOrder.shippingStreet,
            destination_postal_code: Number(updatedOrder.shippingPostalCode) || 44161,
            destination_area_id: updatedOrder.shippingCity,
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
          if (shipment && shipment.id) {
            await prisma.order.update({
              where: { id: updatedOrder.id },
              data: {
                status: 'SHIPPED',
                shippingOrderId: shipment.id,
                shippingWaybill: shipment.courier?.waybill_id || shipment.id,
                trackingNumber: shipment.courier?.waybill_id || shipment.id,
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
    }

    return NextResponse.json({ success: true, status: order.status })
  } catch (error: any) {
    console.error('[CONFIRM_PAYMENT_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal konfirmasi pembayaran' }, { status: 500 })
  }
}
