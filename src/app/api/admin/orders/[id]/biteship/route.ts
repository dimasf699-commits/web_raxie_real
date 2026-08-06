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
    const destinationAreaId = (order.shippingCity && order.shippingCity.startsWith('ID'))
      ? order.shippingCity
      : 'IDNP9IDNC122IDND450IDZ44161'
      
    const courierCode = order.courierName
      ? (order.courierName.toLowerCase().includes('j&t') ? 'jnt' :
         order.courierName.toLowerCase().includes('sicepat') ? 'sicepat' : 'jne')
      : 'jne'

    const biteshipOrderPayload = {
      shipper_contact_name: "Raxie Store",
      shipper_contact_phone: "082128862433",
      shipper_contact_email: "raxieleather@gmail.com",
      origin_area_id: originAreaId,
      origin_address: "Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat",
      destination_contact_name: order.shippingName,
      destination_contact_phone: order.shippingPhone,
      destination_contact_email: order.guestEmail || "customer@raxie.my.id",
      destination_address: order.shippingStreet,
      destination_postal_code: Number(order.shippingPostalCode) || 44161,
      destination_area_id: destinationAreaId,
      destination_note: "Mohon titipkan ke satpam jika tidak ada orang",
      courier_company: courierCode,
      courier_type: "reg",
      delivery_type: "now",
      items: order.items.map((item) => ({
        name: item.productName,
        description: item.variantName || item.productName,
        value: item.price,
        quantity: item.quantity,
        weight: 500,
      })),
    }

    const shipment = await createBiteshipOrder(biteshipOrderPayload)

    if (shipment && shipment.success) {
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

    return NextResponse.json({ error: shipment?.error || 'Gagal membuat pengiriman Biteship' }, { status: 400 })
  } catch (error: any) {
    console.error('[ADMIN_BITESHIP_TRIGGER_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal panggil Biteship' }, { status: 500 })
  }
}
