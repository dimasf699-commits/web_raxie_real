import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const identifier = req.ip || 'anonymous'
    const limit = await rateLimit(`restock_alert:${identifier}`, 5, 3600) // 5x per jam

    if (!limit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      )
    }

    const { email, productId } = await req.json()

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email dan produk wajib diisi' }, { status: 400 })
    }

    // Check if alert already exists for this email & product
    const existing = await prisma.restockAlert.findFirst({
      where: {
        email: email.toLowerCase(),
        productId,
      }
    })

    if (!existing) {
      await prisma.restockAlert.create({
        data: {
          email: email.toLowerCase(),
          productId,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RESTOCK_ALERT_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
