import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, unread, today
    const status = searchParams.get('status') || 'ALL' // ALL, Waiting, Admin Reply, Customer Reply, Resolved, Closed

    const where: any = {}

    if (status !== 'ALL') {
      where.status = status
    }

    if (filter === 'unread') {
      where.unreadAdmin = { gt: 0 }
    } else if (filter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where.updatedAt = { gte: today }
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const conversations = await prisma.chatConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
      },
    })

    return NextResponse.json({ conversations, sessions: conversations })
  } catch (error) {
    console.error('[CHAT_LIST_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
