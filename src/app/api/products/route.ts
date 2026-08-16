import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCache, setCache, CACHE_TTL } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const cursor = searchParams.get('cursor') || undefined
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : 8

    // Generate Redis Cache Key for public listing queries
    const cacheKey = `api:products:${sort}:${category}:${q}:${minPrice}:${maxPrice}:${limit}:${cursor || ''}`
    const cachedData = await getCache<any>(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
      })
    }

    const where: Prisma.ProductWhereInput = { isActive: true }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ]
    }

    if (category && category.toLowerCase() !== 'semua produk') {
      where.category = {
        slug: { equals: category.toLowerCase(), mode: 'insensitive' }
      }
    }

    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = Number(minPrice)
      if (maxPrice) where.basePrice.lte = Number(maxPrice)
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'price-asc':   orderBy = { basePrice: 'asc' };  break
      case 'price-desc':  orderBy = { basePrice: 'desc' }; break
      case 'newest':      orderBy = { createdAt: 'desc' }; break
      case 'best-seller': orderBy = { totalSold: 'desc' }; break
      case 'rating':      orderBy = { avgRating: 'desc' }; break
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        compareAtPrice: true,
        avgRating: true,
        reviewCount: true,
        isBestSeller: true,
        isNew: true,
        material: true,
        description: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { id: true, name: true, price: true, stock: true, sku: true }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { url: true }
        },
        category: {
          select: { name: true, slug: true }
        },
      },
    })

    const hasMore = products.length > limit
    const slice = hasMore ? products.slice(0, limit) : products
    const nextCursor = hasMore ? slice[slice.length - 1].id : null

    const formatted = slice.map(p => {
      const v = p.variants[0]
      const img = p.images[0]
      return {
        id: v?.id ?? p.id,
        productId: p.id,
        variantId: v?.id,
        variantName: v?.name && v.name !== 'Default' ? v.name : undefined,
        name: p.name,
        slug: p.slug,
        price: v?.price ?? p.basePrice,
        compareAtPrice: p.compareAtPrice,
        image: img?.url ?? '/placeholder.jpg',
        avgRating: p.avgRating,
        reviewCount: p.reviewCount,
        isBestSeller: p.isBestSeller,
        isNew: p.isNew,
        stock: v?.stock ?? 0,
        sku: v?.sku ?? '',
        categoryName: p.category.name,
        material: p.material ?? '',
        description: p.description ?? '',
      }
    })

    const responsePayload = { products: formatted, nextCursor }
    await setCache(cacheKey, responsePayload, CACHE_TTL.SHORT)

    return NextResponse.json(responsePayload, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
    })
  } catch (error) {
    console.error('[PRODUCTS_API_ERROR]', error)
    return NextResponse.json({ error: 'Gagal memuat produk' }, { status: 500 })
  }
}
