import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { room: string } }
) {
  try {
    const roomId = params.room

    const session = await prisma.chatSession.findUnique({
      where: { id: roomId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Chat room tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('[CHAT_ROOM_GET_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
