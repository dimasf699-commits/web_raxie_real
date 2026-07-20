import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: {
          take: 1,
          select: { url: true }
        },
        category: {
          select: { name: true }
        }
      },
      take: 5
    })

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.basePrice,
      image: p.images[0]?.url || '',
      category: p.category.name
    }))

    return NextResponse.json({ results: formatted })
  } catch (error) {
    console.error('[SEARCH_API_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat mencari' }, { status: 500 })
  }
}
