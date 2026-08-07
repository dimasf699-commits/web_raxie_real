import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiter: max 10 requests per 10 seconds per session
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

// XSS Sanitizer
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
      sender,
      senderName,
      message,
      type = 'TEXT',
      attachmentUrl,
      attachmentType,
      attachmentName,
    } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID diperlukan' }, { status: 400 })
    }

    if (isRateLimited(sessionId)) {
      return NextResponse.json(
        { error: 'Batas pengiriman pesan terlampaui (maksimal 10 pesan dalam 10 detik).' },
        { status: 429 }
      )
    }

    const cleanMessage = sanitizeHtml(message || '')
    const isUser = sender === 'USER'

    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: sender || 'USER',
        senderName: senderName || (isUser ? 'Pelanggan' : 'CS Raxie Admin'),
        message: cleanMessage,
        type: type || 'TEXT',
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentType || null,
        attachmentName: attachmentName || null,
        isRead: false,
      },
    })

    // Update session timestamp and unread counters
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
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
