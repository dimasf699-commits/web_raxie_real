import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { createBiteshipOrder } from '@/lib/biteship'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Validate signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const signatureString = `${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`
    const expectedSignature = crypto
      .createHash('sha512')
      .update(signatureString)
      .digest('hex')

    if (expectedSignature !== data.signature_key) {
      console.warn('Webhook signature mismatch:', { expectedSignature, received: data.signature_key })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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
      const order = await prisma.order.update({
        where: { orderNumber: order_id },
        data: { 
          status: newStatus as any,
          ...(paidAt ? { paidAt } : {})
        },
        include: { items: true } // Need items for Biteship
      })

      // If paid, trigger automated shipping creation via Biteship
      if (shouldCreateShipment && !order.shippingOrderId && order.shippingCity && order.shippingPostalCode) {
        try {
          const STORE_AREA_ID = process.env.STORE_AREA_ID || 'IDNP9IDNC122IDND450IDZ44161'
          
          // Split courierName from format (e.g. "JNE_REG")
          let company = 'jne'
          let type = 'reg'
          
          if (order.courierName) {
            // Assume format "Bebas Ongkir" or real ones from API
            // For real ones, the ID is company_serviceCode (e.g. jne_reg)
            // But we only have courierName in the DB. Wait, courierName is the readable name. 
            // We should use the generic values, Biteship API expects company and type
            company = order.courierName.toLowerCase().includes('j&t') ? 'jnt' : 
                      order.courierName.toLowerCase().includes('sicepat') ? 'sicepat' : 'jne'
          }

          const biteshipOrderPayload = {
            shipper_contact_name: "Raxie Store",
            shipper_contact_phone: "081234567890",
            origin_area_id: STORE_AREA_ID,
            destination_contact_name: order.shippingName,
            destination_contact_phone: order.shippingPhone,
            destination_contact_email: order.guestEmail || "customer@raxie.id",
            destination_address: order.shippingStreet,
            destination_postal_code: order.shippingPostalCode,
            destination_area_id: order.shippingCity, // shippingCity actually contains the areaId from checkout
            destination_note: "Mohon titipkan ke satpam jika tidak ada orang",
            courier_company: company,
            courier_type: type,
            delivery_type: "now",
            items: order.items.map(item => ({
              name: item.productName,
              description: item.variantName || item.productName,
              value: item.price,
              quantity: item.quantity,
              weight: 500 // fallback
            }))
          }

          const shipment = await createBiteshipOrder(biteshipOrderPayload)

          if (shipment && shipment.id) {
            // Update order with Waybill and Shipment ID
            await prisma.order.update({
              where: { id: order.id },
              data: {
                shippingOrderId: shipment.id,
                shippingWaybill: shipment.courier?.waybill_id || null,
              }
            })
          }
        } catch (err) {
          console.error('Failed to create Biteship shipment:', err)
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[MIDTRANS_WEBHOOK_ERROR]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
