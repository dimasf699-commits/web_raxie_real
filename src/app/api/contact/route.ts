import { NextRequest, NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Nama, email, dan pesan wajib diisi' }, { status: 400 })
    }

    await sendContactFormEmail(name, email, message)
    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim' })
  } catch (error: any) {
    console.error('[CONTACT_API_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}
