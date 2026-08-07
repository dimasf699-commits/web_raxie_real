import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await req.json()
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Pilih setidaknya 1 pesanan untuk dihapus' }, { status: 400 })
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: { in: ids } },
    })

    await prisma.order.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      success: true,
      message: `${ids.length} pesanan berhasil dihapus sekaligus!`,
    })
  } catch (error: any) {
    console.error('[BULK_DELETE_ORDERS_ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal menghapus pesanan terpilih' },
      { status: 500 }
    )
  }
}
