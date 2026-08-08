import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_CATEGORIES = [
  { name: 'Dompet', slug: 'dompet' },
  { name: 'Tas', slug: 'tas' },
  { name: 'Sabuk', slug: 'sabuk' },
]

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('[CATEGORIES_GET_ERROR]', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
