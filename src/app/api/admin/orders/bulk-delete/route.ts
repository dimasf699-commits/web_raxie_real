import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 })
    }

    const { ids } = await req.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Pilih setidaknya 1 pesanan untuk dihapus' }, { status: 400 })
    }

    // Fetch existing orders to check statuses
    const orders = await prisma.order.findMany({
      where: { id: { in: ids } },
      include: { items: true },
    })

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Tidak ada pesanan yang ditemukan' }, { status: 404 })
    }

    // Security check: Protect paid, processed, and shipped orders from accidental bulk deletion
    const ALLOWED_DELETE_STATUSES = ['PENDING_PAYMENT', 'CANCELLED']
    const illegalOrders = orders.filter(o => !ALLOWED_DELETE_STATUSES.includes(o.status))

    if (illegalOrders.length > 0) {
      return NextResponse.json(
        { 
          error: `Pesanan dengan status "${illegalOrders.map(o => o.orderNumber).join(', ')}" tidak dapat dihapus karena sudah dibayar atau dalam proses pengiriman.` 
        }, 
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      // Restore reserved stock for any PENDING_PAYMENT orders being deleted
      for (const order of orders) {
        if (order.status === 'PENDING_PAYMENT') {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              })
            }
          }
          if (order.voucherId) {
            await tx.voucher.update({
              where: { id: order.voucherId },
              data: { usageCount: { decrement: 1 } },
            }).catch(() => {})
          }
        }
      }

      // Delete dependencies
      await tx.voucherUsage.deleteMany({ where: { orderId: { in: ids } } })
      await tx.orderTracking.deleteMany({ where: { orderId: { in: ids } } })
      await tx.orderItem.deleteMany({ where: { orderId: { in: ids } } })
      await tx.order.deleteMany({ where: { id: { in: ids } } })
    })

    return NextResponse.json({
      success: true,
      message: `${orders.length} pesanan berhasil dihapus dan stok telah disesuaikan.`,
    })
  } catch (error: any) {
    console.error('[BULK_DELETE_ORDERS_ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal menghapus pesanan terpilih' },
      { status: 500 }
    )
  }
}
