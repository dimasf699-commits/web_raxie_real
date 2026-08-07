import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatSessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ sessions: chatSessions })
  } catch (error) {
    console.error('[ADMIN_CHAT_GET_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
