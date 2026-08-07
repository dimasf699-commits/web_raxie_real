import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, conversationId, status = 'Closed' } = body
    const activeId = conversationId || sessionId

    if (!activeId) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const updated = await prisma.chatConversation.update({
      where: { id: activeId },
      data: { status, updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, conversation: updated, session: updated })
  } catch (error) {
    console.error('[CHAT_CLOSE_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
