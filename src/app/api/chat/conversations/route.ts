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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, customerName, customerEmail, customerPhone, guestId, userId } = body

    // Validation 1: Customer Name is mandatory
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { error: 'Nama Lengkap wajib diisi.', field: 'customerName' },
        { status: 400 }
      )
    }

    // Validation 2: Email format if provided
    if (customerEmail && customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail.trim())) {
        return NextResponse.json(
          { error: 'Format Email tidak valid.', field: 'customerEmail' },
          { status: 400 }
        )
      }
    }

    // Validation 3: Phone format if provided
    if (customerPhone && customerPhone.trim()) {
      const phoneClean = customerPhone.replace(/\D/g, '')
      if (phoneClean.length < 8 || phoneClean.length > 15) {
        return NextResponse.json(
          { error: 'Nomor Handphone/WhatsApp harus antara 8 hingga 15 digit.', field: 'customerPhone' },
          { status: 400 }
        )
      }
    }

    const cleanName = sanitizeHtml(customerName.trim())
    const cleanEmail = customerEmail ? sanitizeHtml(customerEmail.trim()) : null
    const cleanPhone = customerPhone ? sanitizeHtml(customerPhone.trim()) : null

    if (conversationId) {
      const existing = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { attachments: true },
          },
        },
      })
      if (existing) {
        return NextResponse.json({ conversation: existing })
      }
    }

    // Create new conversation
    const newConv = await prisma.chatConversation.create({
      data: {
        userId: userId || null,
        guestId: guestId || null,
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
  } catch (error) {
    console.error('[CONVERSATIONS_POST_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, unread, today
    const status = searchParams.get('status') || 'ALL' // ALL, Waiting, Admin Reply, Customer Reply, Resolved, Closed

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
  } catch (error) {
    console.error('[CONVERSATIONS_GET_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
