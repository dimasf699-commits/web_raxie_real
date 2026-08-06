import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_CATEGORIES = [
  { name: 'Dompet', slug: 'dompet' },
  { name: 'Tas', slug: 'tas' },
  { name: 'Sabuk', slug: 'sabuk' },
]

export async function GET() {
  try {
    // Upsert default 3 categories to ensure they always exist in DB
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, isActive: true },
        create: { name: cat.name, slug: cat.slug, isActive: true },
      })
    }

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        slug: { in: ['dompet', 'tas', 'sabuk'] },
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('[CATEGORIES_GET_ERROR]', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
