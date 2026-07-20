import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Harus login untuk memberikan ulasan' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data ulasan tidak valid' }, { status: 400 })
    }

    const { productId, rating, comment } = parsed.data

    // Check if user has purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: 'COMPLETED'
        }
      }
    })

    if (!hasPurchased) {
      return NextResponse.json({ error: 'Anda harus membeli produk ini terlebih dahulu' }, { status: 403 })
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

    // Update product stats
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true }
    })
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: productId },
      data: {
        reviewCount: allReviews.length,
        avgRating,
      }
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (error) {
    console.error('[REVIEW_CREATE_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengirim ulasan' }, { status: 500 })
  }
}
