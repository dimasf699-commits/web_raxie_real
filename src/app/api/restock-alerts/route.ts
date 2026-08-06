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

    const { email, productId, variantId } = await req.json()

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email dan produk wajib diisi' }, { status: 400 })
    }

    // Check if product/variant exists
    const variant = variantId
      ? await prisma.productVariant.findUnique({ where: { id: variantId }, select: { id: true, stock: true } })
      : null

    if (variant && variant.stock > 0) {
      return NextResponse.json({ error: 'Stok masih tersedia, silakan langsung beli!' }, { status: 400 })
    }

    // Upsert restock alert (prevent duplicate)
    await prisma.restockAlert.upsert({
      where: {
        email_productId_variantId: {
          email: email.toLowerCase(),
          productId,
          variantId: variantId || '',
        }
      },
      update: { createdAt: new Date() }, // refresh timestamp
      create: {
        email: email.toLowerCase(),
        productId,
        variantId: variantId || '',
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RESTOCK_ALERT_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
