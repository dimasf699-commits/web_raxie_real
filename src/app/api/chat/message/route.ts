import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, conversationId, sender, senderName, message } = body
    const activeId = conversationId || sessionId

    if (!activeId || !message || !message.trim()) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const isUser = sender === 'USER'

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: activeId,
        sender: sender || 'USER',
        senderName: senderName || (isUser ? 'Pelanggan' : 'CS Raxie Official'),
        message: message.trim(),
        status: 'Sent',
      },
    })

    await prisma.chatConversation.update({
      where: { id: activeId },
      data: {
        status: isUser ? 'Customer Reply' : 'Admin Reply',
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
