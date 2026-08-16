import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`voucher_validate:${identifier}`, 10, 60)
    
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'X-RateLimit-Reset': limit.reset.toString() } }
      )
    }

    const { code, cartSubtotal } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Kode voucher harus diisi' }, { status: 400 })
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!voucher) {
      return NextResponse.json({ error: 'Kode voucher tidak ditemukan' }, { status: 404 })
    }

    if (!voucher.isActive) {
      return NextResponse.json({ error: 'Kode voucher sudah tidak aktif' }, { status: 400 })
    }

    const now = new Date()
    if (voucher.startsAt && now < voucher.startsAt) {
      return NextResponse.json({ error: 'Kode voucher belum bisa digunakan' }, { status: 400 })
    }

    if (voucher.expiresAt && now > voucher.expiresAt) {
      return NextResponse.json({ error: 'Kode voucher sudah kadaluarsa' }, { status: 400 })
    }

    if (cartSubtotal < voucher.minPurchase) {
      return NextResponse.json({ error: `Minimal belanja Rp ${voucher.minPurchase.toLocaleString('id-ID')} untuk menggunakan voucher ini` }, { status: 400 })
    }

    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
      return NextResponse.json({ error: 'Batas penggunaan voucher sudah habis' }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (voucher.type === 'PERCENTAGE') {
      discountAmount = (cartSubtotal * voucher.value) / 100
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount
      }
    } else if (voucher.type === 'FIXED_AMOUNT') {
      discountAmount = voucher.value
    } else if (voucher.type === 'FREE_SHIPPING') {
      // In a real scenario, this would apply against the shipping cost, not subtotal
      // But for validation purposes, we return the max shipping discount value
      discountAmount = voucher.value 
    }

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        discountAmount,
      }
    }, {
      headers: {
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[VOUCHER_VALIDATE_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat memvalidasi voucher' }, { status: 500 })
  }
}
