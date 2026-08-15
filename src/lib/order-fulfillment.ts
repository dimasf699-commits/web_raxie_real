import { prisma } from '@/lib/prisma'
import { createBiteshipOrder } from '@/lib/biteship'
import { sendOrderEmail, sendShippingEmail } from '@/lib/email'

export interface FulfillmentResult {
  success: boolean
  shipmentCreated: boolean
  trackingNumber?: string
  shippingOrderId?: string
  error?: string
}

/**
 * Centralized Order Fulfillment Service
 * Handles:
 * 1. Payment confirmation & customer confirmation email
 * 2. Automated Biteship shipment creation with strict customer destination validation
 * 3. Tracking history and status update
 * 4. Product totalSold increment
 */
export async function processOrderFulfillment(orderNumber: string): Promise<FulfillmentResult> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: { select: { id: true, weight: true } },
            variant: { select: { id: true, weight: true } },
          },
        },
        user: { select: { email: true, name: true } },
      },
    })

    if (!order) {
      return { success: false, shipmentCreated: false, error: `Order ${orderNumber} not found` }
    }

    // 1. Send Order Confirmation Email if paid
    const customerEmail = order.user?.email || order.guestEmail
    if (customerEmail) {
      sendOrderEmail(customerEmail, order.orderNumber, order.totalAmount).catch((err) =>
        console.error('[FULFILLMENT_EMAIL_ERROR]', err)
      )
    }

    // 2. Increment totalSold for each product
    try {
      await Promise.all(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { totalSold: { increment: item.quantity } },
          })
        )
      )
    } catch (err) {
      console.error('[UPDATE_TOTAL_SOLD_ERROR]', err)
    }

    // 3. Biteship Automated Shipping Creation
    // IDEMPOTENCY CHECK: If already shipped or has shippingOrderId, skip creating duplicate shipment
    if (order.shippingOrderId || order.shippingWaybill) {
      return {
        success: true,
        shipmentCreated: false,
        shippingOrderId: order.shippingOrderId || undefined,
        trackingNumber: order.shippingWaybill || order.trackingNumber || undefined,
      }
    }

    // Determine Customer Destination Area ID
    let destinationAreaId = order.shippingAreaId
    if (!destinationAreaId && order.shippingCity && order.shippingCity.startsWith('ID')) {
      destinationAreaId = order.shippingCity
    }

    // ORIGIN STORE CONSTANTS
    const STORE_AREA_ID = process.env.STORE_AREA_ID || 'IDNP9IDNC122IDND450IDZ44161'
    const STORE_ORIGIN_ADDRESS = process.env.STORE_ORIGIN_ADDRESS || 'Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat'
    const STORE_PHONE = process.env.STORE_PHONE || '082128862433'
    const STORE_EMAIL = process.env.STORE_EMAIL || 'raxieleather@gmail.com'

    // VALIDATION: Never silently fall back to STORE_AREA_ID as customer destination!
    if (!destinationAreaId || destinationAreaId === STORE_AREA_ID) {
      console.warn(`[FULFILLMENT_WARNING] Order ${orderNumber} does not have a valid customer destination areaId (${destinationAreaId}). Skipping automated Biteship booking. Manual dispatch required.`)
      return {
        success: true,
        shipmentCreated: false,
        error: 'Alamat tujuan belum memiliki Biteship Area ID yang valid. Pengiriman diproses manual oleh admin.',
      }
    }

    if (!order.shippingStreet) {
      console.warn(`[FULFILLMENT_WARNING] Order ${orderNumber} missing shipping street. Skipping Biteship creation.`)
      return { success: true, shipmentCreated: false, error: 'Alamat jalan belum lengkap' }
    }

    // Determine courier company and type
    let courierCompany = 'jne'
    let courierType = 'reg'

    if (order.courierName) {
      const lower = order.courierName.toLowerCase()
      if (lower.includes('j&t') || lower.includes('jnt')) courierCompany = 'jnt'
      else if (lower.includes('sicepat')) courierCompany = 'sicepat'
      else if (lower.includes('anteraja')) courierCompany = 'anteraja'
      else if (lower.includes('gosend')) courierCompany = 'gosend'
      else courierCompany = 'jne'
    }

    const biteshipPayload = {
      origin_contact_name: 'Raxie Store',
      origin_contact_phone: STORE_PHONE,
      origin_contact_email: STORE_EMAIL,
      shipper_contact_name: 'Raxie Store',
      shipper_contact_phone: STORE_PHONE,
      shipper_contact_email: STORE_EMAIL,
      origin_area_id: STORE_AREA_ID,
      origin_address: STORE_ORIGIN_ADDRESS,
      destination_contact_name: order.shippingName,
      destination_contact_phone: order.shippingPhone,
      destination_contact_email: customerEmail || 'customer@raxie.id',
      destination_address: order.shippingStreet,
      destination_postal_code: Number(order.shippingPostalCode) || 44161,
      destination_area_id: destinationAreaId,
      destination_note: order.notes || 'Aksesoris Kulit Raxie - Mohon titipkan jika tidak ada penerima',
      courier_company: courierCompany,
      courier_type: courierType,
      delivery_type: 'now',
      items: order.items.map((item) => ({
        name: item.productName,
        description: item.variantName || item.productName,
        value: item.price,
        quantity: item.quantity,
        weight: item.variant?.weight || item.product?.weight || 500,
      })),
    }

    const shipment = await createBiteshipOrder(biteshipPayload)

    if (shipment && (shipment.success || shipment.id)) {
      const waybill = shipment.courier?.waybill_id || shipment.id
      const shippingOrderId = shipment.id || shipment.order_id || null

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'SHIPPED',
          shippingOrderId,
          shippingWaybill: waybill,
          trackingNumber: waybill,
          shippedAt: new Date(),
        },
      })

      // Create Tracking Entry
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          description: `Pesanan telah diserahkan ke ${order.courierName || courierCompany.toUpperCase()} dengan no. resi ${waybill}`,
        },
      })

      // Send Shipping Notification Email with Tracking Code
      if (customerEmail && waybill) {
        sendShippingEmail(customerEmail, order.orderNumber, waybill, order.courierName || 'Kurir Pengiriman').catch(
          (err) => console.error('[SHIPPING_EMAIL_ERROR]', err)
        )
      }

      return {
        success: true,
        shipmentCreated: true,
        shippingOrderId: shippingOrderId || undefined,
        trackingNumber: waybill || undefined,
      }
    }

    return {
      success: true,
      shipmentCreated: false,
      error: 'Biteship order creation response did not include ID',
    }
  } catch (error: any) {
    console.error('[PROCESS_ORDER_FULFILLMENT_ERROR]', error)
    return { success: false, shipmentCreated: false, error: error.message || 'Fulfillment process failed' }
  }
}
