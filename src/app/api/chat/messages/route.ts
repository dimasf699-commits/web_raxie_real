import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 10000 })
    return false
  }
  if (record.count >= 10) {
    return true
  }
  record.count++
  return false
}

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

    if (isRateLimited(conversationId)) {
      return NextResponse.json(
        { error: 'Batas pengiriman pesan terlampaui (maksimal 10 pesan dalam 10 detik).' },
        { status: 429 }
      )
    }

    const session = await auth()
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    // Force sender to USER unless user is an authenticated ADMIN
    const actualSender = isAdmin && sender === 'ADMIN' ? 'ADMIN' : 'USER'
    const isUser = actualSender === 'USER'
    const cleanMessage = sanitizeHtml(message || '')

    const conversationExists = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversationExists) {
      return NextResponse.json({ error: 'Sesi chat tidak ditemukan' }, { status: 404 })
    }

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
