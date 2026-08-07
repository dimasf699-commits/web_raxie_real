import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, conversationId, customerName, customerEmail, customerPhone } = body
    const activeId = conversationId || sessionId

    if (activeId) {
      const existing = await prisma.chatConversation.findUnique({
        where: { id: activeId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { attachments: true },
          },
        },
      })
      if (existing) {
        return NextResponse.json({ session: existing, conversation: existing })
      }
    }

    const newConv = await prisma.chatConversation.create({
      data: {
        customerName: customerName || 'Pengunjung Store',
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        status: 'Waiting',
        messages: {
          create: {
            sender: 'ADMIN',
            senderName: 'CS Raxie Official',
            message: 'Halo! Selamat datang di Raxie. Ada yang bisa kami bantu mengenai produk dompet, tas, atau sabuk kulit sintetis kami?',
          },
        },
      },
      include: {
        messages: {
          include: { attachments: true },
        },
      },
    })

    return NextResponse.json({ session: newConv, conversation: newConv })
  } catch (error) {
    console.error('[CHAT_SESSION_POST_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId') || req.nextUrl.searchParams.get('conversationId')
    if (!sessionId) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const conv = await prisma.chatConversation.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
      },
    })

    if (!conv) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (conv.unreadUser > 0) {
      await prisma.chatConversation.update({
        where: { id: sessionId },
        data: { unreadUser: 0 },
      })
    }

    return NextResponse.json({ session: conv, conversation: conv })
  } catch (error) {
    console.error('[CHAT_SESSION_GET_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
