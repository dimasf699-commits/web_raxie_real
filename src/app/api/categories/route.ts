import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCache, setCache, CACHE_TTL } from '@/lib/redis'

export async function GET() {
  try {
    const cacheKey = 'api:categories:list'
    const cachedCategories = await getCache<any[]>(cacheKey)
    if (cachedCategories) {
      return NextResponse.json(cachedCategories, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
      })
    }

    // Soft-deactivate 'aksesoris' category in database if present
    await prisma.category.updateMany({
      where: {
        OR: [
          { slug: 'aksesoris' },
          { name: { equals: 'Aksesoris', mode: 'insensitive' } }
        ]
      },
      data: { isActive: false },
    }).catch(() => {})

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        slug: { notIn: ['aksesoris'] },
        name: { notIn: ['Aksesoris', 'aksesoris'] },
      },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    })

    await setCache(cacheKey, categories, CACHE_TTL.MEDIUM)

    return NextResponse.json(categories, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
    })
  } catch (error) {
    console.error('[CATEGORIES_GET_ERROR]', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
