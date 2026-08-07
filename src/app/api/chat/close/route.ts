import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, status = 'CLOSED' } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID diperlukan' }, { status: 400 })
    }

    const updated = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status },
    })

    return NextResponse.json({ success: true, session: updated })
  } catch (error) {
    console.error('[CHAT_CLOSE_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
