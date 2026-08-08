import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/redis'

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      conversationId,
      sender,
      senderName,
      message,
      attachments = [],
    } = body

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID diperlukan' }, { status: 400 })
    }

    // Redis-backed rate limiting (10 messages per 10 seconds per conversation)
    const limit = await rateLimit(`chat_msg:${conversationId}`, 10, 10)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Batas pengiriman pesan terlampaui. Silakan tunggu sejenak.' },
        { status: 429, headers: { 'X-RateLimit-Reset': limit.reset.toString() } }
      )
    }

    const session = await auth()
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    const conversationExists = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversationExists) {
      return NextResponse.json({ error: 'Sesi chat tidak ditemukan' }, { status: 404 })
    }

    // Force sender to USER unless authenticated as ADMIN
    const actualSender = isAdmin && sender === 'ADMIN' ? 'ADMIN' : 'USER'
    const isUser = actualSender === 'USER'

    // Ownership check: If conversation has a userId, non-admin user must match the userId
    if (isUser && conversationExists.userId && session?.user?.id && conversationExists.userId !== session.user.id) {
      return NextResponse.json({ error: 'Tidak memiliki akses ke percakapan ini' }, { status: 403 })
    }

    const cleanMessage = sanitizeHtml(message || '')

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        sender: actualSender,
        senderName: senderName || (isUser ? (conversationExists.customerName || 'Pelanggan') : 'CS Raxie Official'),
        message: cleanMessage,
        status: 'Sent',
        isRead: false,
        attachments: {
          create: attachments.map((att: any) => ({
            fileUrl: att.url,
            fileName: att.fileName || 'Attachment',
            fileType: att.fileType || 'IMAGE',
            mimeType: att.mimeType || 'image/jpeg',
            fileSize: att.fileSize || 0,
          })),
        },
      },
      include: {
        attachments: true,
      },
    })

    // Auto update conversation status and timestamps
    const newStatus = isUser ? 'Customer Reply' : 'Admin Reply'
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        unreadAdmin: isUser ? { increment: 1 } : 0,
        unreadUser: !isUser ? { increment: 1 } : 0,
      },
    })

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('[CHAT_MESSAGES_POST_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengirim pesan' }, { status: 500 })
  }
}
