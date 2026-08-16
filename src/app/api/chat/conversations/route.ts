import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

let tablesEnsured = false

async function ensureTablesExist() {
  if (tablesEnsured) return
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.chat_sessions (
        id TEXT PRIMARY KEY,
        "userId" TEXT,
        "guestId" TEXT,
        "customerName" TEXT NOT NULL DEFAULT 'Pelanggan Raxie',
        "customerEmail" TEXT,
        "customerPhone" TEXT,
        status TEXT NOT NULL DEFAULT 'Waiting',
        "unreadAdmin" INTEGER NOT NULL DEFAULT 0,
        "unreadUser" INTEGER NOT NULL DEFAULT 0,
        "isTypingUser" BOOLEAN NOT NULL DEFAULT false,
        "isTypingAdmin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.chat_messages (
        id TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        "senderName" TEXT NOT NULL DEFAULT 'Pelanggan',
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Sent',
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.chat_attachments (
        id TEXT PRIMARY KEY,
        "messageId" TEXT NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
        "fileUrl" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileType" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `)
    tablesEnsured = true
  } catch (err) {
    console.error('[ENSURE_TABLES_ERROR]', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { conversationId, customerName, customerEmail, customerPhone, guestId, userId } = body

    // Validation 1: Customer Name is mandatory
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return NextResponse.json(
        { error: 'Nama Lengkap wajib diisi.', field: 'customerName' },
        { status: 400 }
      )
    }

    // Validation 2: Email format if provided
    if (customerEmail && typeof customerEmail === 'string' && customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail.trim())) {
        return NextResponse.json(
          { error: 'Format Email tidak valid.', field: 'customerEmail' },
          { status: 400 }
        )
      }
    }

    // Validation 3: Phone format if provided
    if (customerPhone && typeof customerPhone === 'string' && customerPhone.trim()) {
      const phoneClean = customerPhone.replace(/\D/g, '')
      if (phoneClean.length < 8 || phoneClean.length > 15) {
        return NextResponse.json(
          { error: 'Nomor Handphone/WhatsApp harus antara 8 hingga 15 digit.', field: 'customerPhone' },
          { status: 400 }
        )
      }
    }

    const cleanName = sanitizeHtml(customerName.trim())
    const cleanEmail = customerEmail && typeof customerEmail === 'string' && customerEmail.trim() ? sanitizeHtml(customerEmail.trim()) : null
    const cleanPhone = customerPhone && typeof customerPhone === 'string' && customerPhone.trim() ? sanitizeHtml(customerPhone.trim()) : null

    // Ensure database tables exist automatically
    await ensureTablesExist()

    // Check existing conversation ID if passed with strict ownership verification
    if (conversationId && typeof conversationId === 'string' && conversationId.trim()) {
      try {
        const existing = await prisma.chatConversation.findUnique({
          where: { id: conversationId.trim() },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              include: { attachments: true },
            },
          },
        })
        if (existing) {
          const session = await auth()
          const isAdmin = (session?.user as any)?.role === 'ADMIN'
          
          // If conversation belongs to registered user, verify session ownership
          if (existing.userId) {
            if (!isAdmin && (!session?.user?.id || session.user.id !== existing.userId)) {
              return NextResponse.json({ error: 'Akses percakapan ditolak' }, { status: 403 })
            }
          } else if (existing.guestId) {
            // If guest conversation, verify guestId matches
            if (!isAdmin && (!guestId || existing.guestId !== guestId)) {
              return NextResponse.json({ error: 'Akses percakapan ditolak' }, { status: 403 })
            }
          }
          return NextResponse.json({ conversation: existing })
        }
      } catch (err) {
        console.warn('[CONVERSATION_LOOKUP_WARN]', err)
      }
    }

    // Create new conversation safely
    const newConv = await prisma.chatConversation.create({
      data: {
        userId: typeof userId === 'string' ? userId : null,
        guestId: typeof guestId === 'string' ? guestId : null,
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        status: 'Waiting',
        messages: {
          create: {
            sender: 'ADMIN',
            senderName: 'CS Raxie Official',
            message: `Halo Kak ${cleanName}! Selamat datang di Raxie. Silakan tuliskan pertanyaan atau kendala Anda, tim Customer Support kami siap membantu.`,
            status: 'Sent',
          },
        },
      },
      include: {
        messages: {
          include: { attachments: true },
        },
      },
    })

    return NextResponse.json({ conversation: newConv })
  } catch (error: any) {
    console.error('[CONVERSATIONS_POST_ERROR]', error)
    // Retry creating tables once if failed
    try {
      await ensureTablesExist()
    } catch (e) {
      console.error('[ENSURE_TABLES_RETRY_ERROR]', e)
    }

    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada server saat membuat percakapan.' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist()

    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all'
    const status = searchParams.get('status') || 'ALL'

    const where: any = {}

    if (status !== 'ALL') {
      where.status = status
    }

    if (filter === 'unread') {
      where.unreadAdmin = { gt: 0 }
    } else if (filter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      where.updatedAt = { gte: today }
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const conversations = await prisma.chatConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { attachments: true },
        },
      },
    })

    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('[CONVERSATIONS_GET_ERROR]', error)
    return NextResponse.json({ error: error?.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
