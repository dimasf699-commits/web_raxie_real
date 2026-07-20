import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) return NextResponse.json({ points: 0, activeOrders: 0, totalOrders: 0, recentOrders: [] })

    const [activeOrders, totalOrders, recentOrders, pointsData] = await Promise.all([
      prisma.order.count({
        where: { userId, status: { in: ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED'] } },
      }),
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true },
      }),
      prisma.loyaltyTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      }),
    ])

    return NextResponse.json({
      activeOrders,
      totalOrders,
      recentOrders,
      points: Math.max(0, pointsData._sum.points ?? 0),
    })
  } catch (error) {
    console.error('Account stats error:', error)
    return NextResponse.json({ points: 0, activeOrders: 0, totalOrders: 0, recentOrders: [] })
  }
}
