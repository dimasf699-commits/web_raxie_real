import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('[CONVERSATION_DETAIL_GET_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    const body = await req.json()
    const { status } = body

    const validStatuses = ['Waiting', 'Admin Reply', 'Customer Reply', 'Resolved', 'Closed']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { status, updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, conversation: updated })
  } catch (error) {
    console.error('[CONVERSATION_STATUS_PATCH_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
