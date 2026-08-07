import { NextRequest, NextResponse } from 'next/server'
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
      sessionId,
      conversationId,
      sender,
      senderName,
      message,
      type = 'TEXT',
      attachmentUrl,
      attachmentType,
      attachmentName,
    } = body

    const activeId = conversationId || sessionId

    if (!activeId) {
      return NextResponse.json({ error: 'ID percakapan diperlukan' }, { status: 400 })
    }

    if (isRateLimited(activeId)) {
      return NextResponse.json(
        { error: 'Batas pengiriman pesan terlampaui (maksimal 10 pesan dalam 10 detik).' },
        { status: 429 }
      )
    }

    const cleanMessage = sanitizeHtml(message || '')
    const isUser = sender === 'USER'

    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: activeId,
        sender: sender || 'USER',
        senderName: senderName || (isUser ? 'Pelanggan' : 'CS Raxie Official'),
        message: cleanMessage,
        status: 'Sent',
        isRead: false,
        attachments: attachmentUrl ? {
          create: [{
            fileUrl: attachmentUrl,
            fileName: attachmentName || 'Attachment',
            fileType: type === 'IMAGE' ? 'IMAGE' : 'FILE',
            mimeType: attachmentType || 'image/jpeg',
          }]
        } : undefined
      },
      include: {
        attachments: true
      }
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
    console.error('[CHAT_SEND_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}
