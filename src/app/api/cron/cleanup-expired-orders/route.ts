import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { invalidateProductCache } from '@/lib/cache-invalidation'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // ── AUTHENTICATION CHECK ──────────────────────────────────────────────────
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET

    if (cronSecret) {
      const expectedBearer = `Bearer ${cronSecret}`
      const urlToken = req.nextUrl.searchParams.get('token')
      
      const isHeaderValid = authHeader === expectedBearer || authHeader === cronSecret
      const isTokenValid = urlToken === cronSecret

      if (!isHeaderValid && !isTokenValid) {
        return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Expire orders older than 24 hours (1440 minutes)
    const expiryWindowMs = 24 * 60 * 60 * 1000
    const cutoffDate = new Date(Date.now() - expiryWindowMs)

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        createdAt: { lt: cutoffDate },
      },
      include: {
        items: true,
      },
    })

    let cancelledCount = 0

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        // 1. Mark order as CANCELLED
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            notes: (order.notes ? order.notes + ' | ' : '') + 'Dibatalkan otomatis oleh sistem (pembayaran kadaluarsa)',
          },
        })

        // 2. Restore reserved stock for each variant
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          }
        }

        // 3. Add order tracking record
        await tx.orderTracking.create({
          data: {
            orderId: order.id,
            status: 'CANCELLED',
            description: 'Pesanan dibatalkan otomatis karena batas waktu pembayaran (24 jam) telah berakhir',
          },
        })
      })

      // Invalidate product caches on-demand due to stock restoration
      for (const item of order.items) {
        if (item.productId) {
          invalidateProductCache({ productId: item.productId }).catch(() => {})
        }
      }

      cancelledCount++
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses ${cancelledCount} pesanan kadaluarsa`,
      cancelledCount,
    })
  } catch (error: any) {
    console.error('[CRON_CLEANUP_ERROR]', error)
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pembersihan pesanan' },
      { status: 500 }
    )
  }
}
