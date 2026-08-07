import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, role = 'ADMIN' } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID diperlukan' }, { status: 400 })
    }

    const isUser = role === 'USER'

    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
        sender: isUser ? 'ADMIN' : 'USER',
      },
      data: { isRead: true, status: 'Read' },
    })

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: isUser ? { unreadUser: 0 } : { unreadAdmin: 0 },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CHAT_READ_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
