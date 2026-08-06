import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBiteshipOrder } from '@/lib/biteship'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    if (order.shippingWaybill) {
      return NextResponse.json({ error: `Resi sudah ada: ${order.shippingWaybill}` }, { status: 400 })
    }

    const originAreaId = process.env.STORE_AREA_ID || 'IDNP9IDNC122IDND450IDZ44161'
    const courierCode = (order.courierName || 'jne').toLowerCase().replace(/[^a-z0-9]/g, '')

    const biteshipOrderPayload = {
      origin_area_id: originAreaId,
      destination_area_id: order.shippingPostalCode,
      destination_address: order.shippingStreet,
      destination_postal_code: Number(order.shippingPostalCode) || 44161,
      destination_note: order.shippingCity || 'Garut',
      courier_company: courierCode || 'jne',
      courier_type: 'reg',
      delivery_type: 'now',
      items: order.items.map((item) => ({
        name: item.productName,
        value: item.price,
        quantity: item.quantity,
      })),
      shipper: {
        name: 'Raxie Official',
        phone: '082128862433',
        email: 'raxieleather@gmail.com',
      },
      destination: {
        name: order.shippingName,
        phone: order.shippingPhone,
        email: order.guestEmail || 'customer@raxie.my.id',
      },
    }

    const shipment = await createBiteshipOrder(biteshipOrderPayload)

    if (shipment && shipment.id) {
      const waybill = shipment.courier?.waybill_id || shipment.id
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'SHIPPED',
          trackingNumber: waybill,
          shippingWaybill: waybill,
          shippedAt: new Date(),
        },
      })
      return NextResponse.json({ success: true, waybill, order: updatedOrder })
    }

    return NextResponse.json({ error: 'Gagal membuat pengiriman Biteship' }, { status: 500 })
  } catch (error: any) {
    console.error('[ADMIN_BITESHIP_TRIGGER_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal panggil Biteship' }, { status: 500 })
  }
}
