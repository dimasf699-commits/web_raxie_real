import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, sender, senderName, message } = body

    if (!sessionId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const isUser = sender === 'USER'

    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: sender || 'USER',
        senderName: senderName || (isUser ? 'Pelanggan' : 'CS Raxie'),
        message: message.trim(),
      },
    })

    // Update unread count and session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
        unreadAdmin: isUser ? { increment: 1 } : 0,
        unreadUser: !isUser ? { increment: 1 } : 0,
      },
    })

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('[CHAT_MESSAGE_POST_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
