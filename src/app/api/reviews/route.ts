import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit } from '@/lib/redis'

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Rate Limiting: 3 reviews per minute per user/IP
    const identifier = session?.user?.id || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`review_create:${identifier}`, 3, 60)
    
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Terlalu sering mengirim ulasan. Tunggu sejenak.' },
        { status: 429, headers: { 'X-RateLimit-Reset': limit.reset.toString() } }
      )
    }
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Harus login untuk memberikan ulasan' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data ulasan tidak valid' }, { status: 400 })
    }

    const { productId, rating, comment } = parsed.data

    // Check if user has purchased and received the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: { in: ['DELIVERED', 'COMPLETED'] }
        }
      }
    })

    if (!hasPurchased) {
      return NextResponse.json({ error: 'Anda harus menyelesaikan pesanan produk ini terlebih dahulu untuk memberikan ulasan' }, { status: 403 })
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId: session.user.id }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'Anda sudah memberikan ulasan untuk produk ini' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        body: comment,
        isApproved: true, // Auto approve for now
      }
    })

    // Update product stats using DB aggregation for high performance
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _count: { rating: true },
      _avg: { rating: true },
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        reviewCount: stats._count.rating || 0,
        avgRating: stats._avg.rating || 0,
      }
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error) {
    console.error('[REVIEW_CREATE_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengirim ulasan' }, { status: 500 })
  }
}
