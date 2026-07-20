import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: { select: { stock: true, price: true, sku: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit })
  } catch (error) {
    console.error('Admin products GET error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name, slug, description, shortDescription,
      categoryId, basePrice, compareAtPrice,
      isFeatured, isNew, isBestSeller,
      material, weight, tags,
      images, variants,
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        basePrice: parseFloat(basePrice),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? true,
        isBestSeller: isBestSeller ?? false,
        material,
        weight: weight ? parseFloat(weight) : null,
        tags: tags ?? [],
        images: {
          create: (images ?? []).map((url: string, i: number) => ({
            url,
            sortOrder: i,
          })),
        },
        variants: {
          create: (variants ?? []).map((v: any, i: number) => ({
            sku: v.sku,
            name: v.name,
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            price: v.price ? parseFloat(v.price) : 0,
            stock: v.stock ? parseInt(v.stock) : 0,
            sortOrder: i,
          })),
        },
      },
      include: { images: true, variants: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Admin products POST error:', error)
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 })
  }
}
