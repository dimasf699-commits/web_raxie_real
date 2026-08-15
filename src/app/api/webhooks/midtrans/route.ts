import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { createBiteshipOrder } from '@/lib/biteship'
import { sendOrderEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Validate signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const sigRaw = `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`
    const expectedSig1 = crypto.createHash('sha512').update(sigRaw).digest('hex')

    const grossNum = Number(data.gross_amount)
    const sigFormatted = `${data.order_id}${data.status_code}${grossNum.toFixed(2)}${serverKey}`
    const expectedSig2 = crypto.createHash('sha512').update(sigFormatted).digest('hex')

    const isValidSignature = (expectedSig1 === data.signature_key || expectedSig2 === data.signature_key)

    if (serverKey && !isValidSignature) {
      console.warn('[MIDTRANS_WEBHOOK] Signature mismatch:', { received: data.signature_key, sigRaw })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 200 })
    }

    const { transaction_status, fraud_status, order_id } = data

    // Map Midtrans status to our Prisma OrderStatus
    let newStatus = undefined
    let paidAt = undefined
    let shouldCreateShipment = false

    if (transaction_status === 'capture') {
        if (fraud_status === 'accept') {
            newStatus = 'PAYMENT_CONFIRMED'
            paidAt = new Date()
            shouldCreateShipment = true
        }
    } else if (transaction_status === 'settlement') {
        newStatus = 'PAYMENT_CONFIRMED'
        paidAt = new Date()
        shouldCreateShipment = true
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
        newStatus = 'CANCELLED'
    } else if (transaction_status === 'pending') {
        newStatus = 'PENDING_PAYMENT'
    }

    if (newStatus) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber: order_id },
        include: { user: { select: { email: true } } }
      })

      if (!existingOrder) {
        console.warn(`[MIDTRANS_WEBHOOK] Order ${order_id} not found in database.`)
        return NextResponse.json({ message: 'Order not found, acknowledged' }, { status: 200 })
      }

      // Idempotency check: Only process payment confirmation if order is currently PENDING_PAYMENT
      const isFirstPaymentConfirmation = shouldCreateShipment && existingOrder.status === 'PENDING_PAYMENT'

      const order = await prisma.order.update({
        where: { orderNumber: order_id },
        data: { 
          status: newStatus as any,
          ...(paidAt && !existingOrder.paidAt ? { paidAt } : {})
        },
        include: { 
          items: {
            include: {
              product: { select: { weight: true } },
              variant: { select: { weight: true } },
            }
          } 
        }
      })

      // Send order confirmation email when payment is confirmed for the first time
      if (isFirstPaymentConfirmation) {
        const customerEmail = existingOrder.user?.email || existingOrder.guestEmail
        if (customerEmail) {
          sendOrderEmail(customerEmail, order.orderNumber, order.totalAmount).catch(console.error)
        }
      }

      // If paid for the first time, trigger automated shipping creation via Biteship
      if (isFirstPaymentConfirmation && !order.shippingOrderId && order.shippingCity && order.shippingPostalCode) {
        try {
          const STORE_AREA_ID = process.env.STORE_AREA_ID || 'IDNP9IDNC122IDND450IDZ44161'
          
          // Split courierName from format (e.g. "JNE_REG")
          let company = 'jne'
          let type = 'reg'
          
          if (order.courierName) {
            company = order.courierName.toLowerCase().includes('j&t') ? 'jnt' : 
                      order.courierName.toLowerCase().includes('sicepat') ? 'sicepat' : 'jne'
          }

          const destinationAreaId = (order.shippingCity && order.shippingCity.startsWith('ID'))
            ? order.shippingCity
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
            destination_contact_name: order.shippingName,
            destination_contact_phone: order.shippingPhone,
            destination_contact_email: order.guestEmail || "customer@raxie.id",
            destination_address: order.shippingStreet,
            destination_postal_code: Number(order.shippingPostalCode) || 44161,
            destination_area_id: destinationAreaId,
            destination_note: "Mohon titipkan ke satpam jika tidak ada orang",
            courier_company: company,
            courier_type: type,
            delivery_type: "now",
            items: order.items.map((item: any) => ({
              name: item.productName,
              description: item.variantName || item.productName,
              value: item.price,
              quantity: item.quantity,
              weight: item.variant?.weight || item.product?.weight || 500
            }))
          }

          const shipment = await createBiteshipOrder(biteshipOrderPayload)

          if (shipment && (shipment.success || shipment.id)) {
            const waybill = shipment.courier?.waybill_id || shipment.id
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'SHIPPED',
                shippingOrderId: shipment.id || shipment.order_id || null,
                shippingWaybill: waybill,
                trackingNumber: waybill,
                shippedAt: new Date(),
              }
            })
          }
        } catch (err) {
          console.error('Failed to create Biteship shipment:', err)
        }
      }

      // Update totalSold for each product when payment is confirmed for the first time
      if (isFirstPaymentConfirmation) {
        try {
          await Promise.all(
            order.items.map(item =>
              prisma.product.update({
                where: { id: item.productId },
                data: { totalSold: { increment: item.quantity } }
              })
            )
          )
        } catch (err) {
          console.error('Failed to update totalSold:', err)
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[MIDTRANS_WEBHOOK_ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 200 })
  }
}
