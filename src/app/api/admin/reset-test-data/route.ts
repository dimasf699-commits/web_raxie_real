import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  // Block this endpoint entirely in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { target } = await req.json().catch(() => ({ target: 'ALL' }))

    if (target === 'ORDERS' || target === 'ALL') {
      // Restore stock before deleting orders (prevents stock corruption)
      const pendingOrders = await prisma.order.findMany({
        where: { status: { in: ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING'] } },
        include: { items: true },
      })

      await prisma.$transaction(async (tx) => {
        // Restore stock for non-cancelled/non-completed orders
        for (const order of pendingOrders) {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              })
            }
          }
        }

        // Then delete all order data
        await tx.voucherUsage.deleteMany({})
        await tx.orderTracking.deleteMany({})
        await tx.orderItem.deleteMany({})
        await tx.order.deleteMany({})
      })
    }

    if (target === 'CHAT' || target === 'ALL') {
      await prisma.chatAttachment.deleteMany({}).catch(() => {})
      await prisma.chatMessage.deleteMany({}).catch(() => {})
      await prisma.chatConversation.deleteMany({}).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Data tes berhasil dibersihkan (development only)',
    })
  } catch (error: any) {
    console.error('[RESET_TEST_DATA_ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal membersihkan data tes' },
      { status: 500 }
    )
  }
}
