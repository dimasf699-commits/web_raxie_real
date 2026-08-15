import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendShippingEmail, sendOrderEmail } from '@/lib/email'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
        trackingHistory: true,
      },
    })

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Admin order GET error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, trackingNumber, courierCode, courierName, courierService } = body

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ message: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    const VALID_TRANSITIONS: Record<string, string[]> = {
      PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
      PAYMENT_CONFIRMED: ['PROCESSING', 'PACKED', 'SHIPPED', 'CANCELLED'],
      PROCESSING: ['PACKED', 'SHIPPED', 'CANCELLED'],
      PACKED: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED', 'COMPLETED', 'RETURN_REQUESTED', 'RETURNED', 'CANCELLED'],
      DELIVERED: ['COMPLETED', 'RETURN_REQUESTED', 'RETURNED'],
      COMPLETED: ['RETURN_REQUESTED', 'RETURNED'],
      RETURN_REQUESTED: ['RETURNED', 'REFUNDED'],
      RETURNED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    }

    if (status && status !== existingOrder.status) {
      const allowedNextStatuses = VALID_TRANSITIONS[existingOrder.status] || []
      if (!allowedNextStatuses.includes(status)) {
        return NextResponse.json(
          { message: `Perubahan status dari ${existingOrder.status} ke ${status} tidak valid.` },
          { status: 400 }
        )
      }
    }

    const data: any = {}
    if (status) {
      data.status = status
      if (status === 'SHIPPED') data.shippedAt = new Date()
      if (status === 'DELIVERED') data.deliveredAt = new Date()
      if (status === 'COMPLETED') data.completedAt = new Date()
      if (status === 'CANCELLED') data.cancelledAt = new Date()
    }
    if (trackingNumber) {
      data.trackingNumber = trackingNumber
      data.shippingWaybill = trackingNumber
    }
    if (courierCode) data.courierCode = courierCode
    if (courierName) data.courierName = courierName
    if (courierService) data.courierService = courierService

    // Restore stock if transitioning to CANCELLED from non-cancelled status
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      for (const item of existingOrder.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }
    }

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

    // Send Order Email if status is updated to PAYMENT_CONFIRMED for the first time
    if (status === 'PAYMENT_CONFIRMED' && existingOrder.status === 'PENDING_PAYMENT') {
      const customerEmail = order.user?.email || order.guestEmail
      if (customerEmail) {
        sendOrderEmail(customerEmail, order.orderNumber, order.totalAmount).catch(console.error)
      }
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, status: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // Protect paid / processed / shipped orders from hard deletion
    const ALLOWED_DELETE_STATUSES = ['PENDING_PAYMENT', 'CANCELLED']
    if (!ALLOWED_DELETE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: 'Pesanan yang sudah dibayar atau dalam proses pengiriman tidak dapat dihapus demi integritas data keuangan.' },
        { status: 400 }
      )
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
