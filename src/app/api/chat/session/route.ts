import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, customerName, customerEmail, customerPhone } = body

    if (sessionId) {
      const existing = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
      if (existing) {
        return NextResponse.json({ session: existing })
      }
    }

    const newSession = await prisma.chatSession.create({
      data: {
        customerName: customerName || 'Pengunjung Store',
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        status: 'ACTIVE',
        messages: {
          create: {
            sender: 'ADMIN',
            senderName: 'CS Raxie',
            message: 'Halo! Selamat datang di Raxie. Ada yang bisa kami bantu mengenai produk dompet, tas, atau sabuk kulit sintetis kami?',
          },
        },
      },
      include: {
        messages: true,
      },
    })

    return NextResponse.json({ session: newSession })
  } catch (error) {
    console.error('[CHAT_SESSION_POST_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Reset unread for user
    if (session.unreadUser > 0) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { unreadUser: 0 },
      })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('[CHAT_SESSION_GET_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
