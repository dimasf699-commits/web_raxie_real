import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`restock_alert:${identifier}`, 5, 3600) // 5x per jam

    if (!limit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      )
    }

    const { email, productId } = await req.json()

    if (!email || typeof email !== 'string' || !email.trim() || !productId) {
      return NextResponse.json({ error: 'Email dan produk wajib diisi' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Check if alert already exists for this email & product
    const existing = await prisma.restockAlert.findFirst({
      where: {
        email: cleanEmail,
        productId: String(productId),
      }
    })

    if (!existing) {
      await prisma.restockAlert.create({
        data: {
          email: cleanEmail,
          productId: String(productId),
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Notifikasi restock berhasil didaftarkan' })
  } catch (error) {
    console.error('[RESTOCK_ALERT_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
