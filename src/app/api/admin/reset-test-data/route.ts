import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { target } = await req.json().catch(() => ({ target: 'ALL' }))

    if (target === 'ORDERS' || target === 'ALL') {
      await prisma.orderItem.deleteMany({})
      await prisma.order.deleteMany({})
    }

    if (target === 'CHAT' || target === 'ALL') {
      await prisma.chatAttachment.deleteMany({}).catch(() => {})
      await prisma.chatMessage.deleteMany({}).catch(() => {})
      await prisma.chatConversation.deleteMany({}).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Seluruh data pesanan & chat tes berhasil dibersihkan 100%!',
    })
  } catch (error: any) {
    console.error('[RESET_TEST_DATA_ERROR]', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal membersihkan data tes' },
      { status: 500 }
    )
  }
}
