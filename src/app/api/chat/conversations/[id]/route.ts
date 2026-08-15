import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID diperlukan' }, { status: 400 })
    }

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

    const session = await auth()
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    // If conversation is linked to a registered user, only that user or Admin can access
    if (conversation.userId) {
      const isOwner = session?.user?.id === conversation.userId
      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: 'Akses ditolak: Anda tidak memiliki izin untuk melihat percakapan ini' },
          { status: 403 }
        )
      }
    } else {
      // Guest conversation
      const guestIdFromHeader = req.headers.get('x-guest-id')
      const guestIdFromQuery = req.nextUrl.searchParams.get('guestId')
      const requesterGuestId = guestIdFromHeader || guestIdFromQuery

      if (!isAdmin && conversation.guestId && requesterGuestId && conversation.guestId !== requesterGuestId) {
        return NextResponse.json(
          { error: 'Akses ditolak: Sesi percakapan tidak sesuai' },
          { status: 403 }
        )
      }
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
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 })
    }

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
