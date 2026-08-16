import { NextRequest, NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`contact_form:${identifier}`, 3, 300) // 3x per 5 minutes

    if (!limit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak pengiriman pesan. Silakan coba lagi beberapa saat.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { name, email, message } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Pesan wajib diisi' }, { status: 400 })
    }

    if (message.trim().length > 3000) {
      return NextResponse.json({ error: 'Pesan terlalu panjang (maksimal 3000 karakter)' }, { status: 400 })
    }

    await sendContactFormEmail(name.trim(), email.trim(), message.trim())
    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim' })
  } catch (error: any) {
    console.error('[CONTACT_API_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}
