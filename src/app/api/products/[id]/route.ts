import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCache, setCache, CACHE_TTL } from '@/lib/redis'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cacheKey = `product_detail:${params.id}`
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    const formatted = {
      id: product.variants[0]?.id ?? product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.variants[0]?.price ?? product.basePrice,
      compareAtPrice: product.compareAtPrice,
      images: product.images.map(i => i.url),
      image: product.images[0]?.url ?? '/placeholder.jpg',
      avgRating: product.avgRating,
      reviewCount: product.reviewCount,
      isBestSeller: product.isBestSeller,
      isNew: product.isNew,
      material: product.material ?? '',
      categoryName: product.category.name,
      variants: product.variants.map(v => ({
        id: v.id,
        name: v.name,
        colorHex: v.colorHex,
        stock: v.stock,
        price: v.price,
        sku: v.sku,
      })),
      stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      sku: product.variants[0]?.sku ?? '',
    }

    await setCache(cacheKey, formatted, CACHE_TTL.LONG)

    return NextResponse.json(formatted, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[PRODUCT_ID_API_ERROR]', error)
    return NextResponse.json({ error: 'Gagal memuat produk' }, { status: 500 })
  }
}
