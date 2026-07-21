import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendShippingEmail } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, trackingNumber, courierCode, courierName, courierService } = body

    const data: any = {}
    if (status) {
      data.status = status
      if (status === 'SHIPPED') data.shippedAt = new Date()
      if (status === 'DELIVERED') data.deliveredAt = new Date()
      if (status === 'COMPLETED') data.completedAt = new Date()
      if (status === 'CANCELLED') data.cancelledAt = new Date()
    }
    if (trackingNumber) data.trackingNumber = trackingNumber
    if (courierCode) data.courierCode = courierCode
    if (courierName) data.courierName = courierName
    if (courierService) data.courierService = courierService

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    // Add tracking history entry
    if (status) {
      await prisma.orderTracking.create({
        data: {
          orderId: params.id,
          status,
          description: `Status diperbarui ke: ${status}`,
          createdBy: (session.user as any)?.id,
        },
      })
    }

    // Send Shipping Email if status is SHIPPED
    if (status === 'SHIPPED' && order.trackingNumber) {
      const customerEmail = order.user?.email || order.guestEmail
      if (customerEmail) {
        sendShippingEmail(
          customerEmail, 
          order.orderNumber, 
          order.trackingNumber, 
          order.courierName || 'Kurir'
        ).catch(console.error)
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Admin order PATCH error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Pesanan berhasil dihapus' })
  } catch (error) {
    console.error('Admin order DELETE error:', error)
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 })
  }
}
