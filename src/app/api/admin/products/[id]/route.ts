import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name, slug, description, shortDescription,
      categoryId, basePrice, compareAtPrice,
      isFeatured, isNew, isBestSeller, isActive,
      material, weight, tags,
    } = body

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        basePrice: parseFloat(basePrice),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        isFeatured: isFeatured ?? false,
        isNew: isNew ?? false,
        isBestSeller: isBestSeller ?? false,
        isActive: isActive ?? true,
        material,
        weight: weight ? parseFloat(weight) : null,
        tags: tags ?? [],
        // Update images and variants by deleting old ones and creating new ones
        images: body.images ? {
          deleteMany: {},
          create: body.images.map((url: string, i: number) => ({ url, sortOrder: i })),
        } : undefined,
        variants: body.variants ? {
          deleteMany: {},
          create: body.variants.map((v: any, i: number) => ({
            sku: v.sku,
            name: v.name,
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            price: v.price ? parseFloat(v.price) : 0,
            stock: v.stock ? parseInt(v.stock) : 0,
            sortOrder: i,
          })),
        } : undefined,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin product PUT error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('Admin product DELETE error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
