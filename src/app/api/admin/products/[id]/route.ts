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

    const product = await prisma.$transaction(async (tx) => {
      // Delete old relations first to avoid unique constraint violations (e.g. SKU)
      if (body.images) {
        await tx.productImage.deleteMany({ where: { productId: params.id } })
      }
      if (body.variants) {
        await tx.productVariant.deleteMany({ where: { productId: params.id } })
      }

      // Update product and create new relations
      return await tx.product.update({
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
          images: body.images ? {
            create: body.images.map((url: string, i: number) => ({ url, sortOrder: i })),
          } : undefined,
          variants: body.variants ? {
            create: body.variants.map((v: any, i: number) => ({
              sku: v.sku,
              name: v.name || "",
              color: v.color || "",
              colorHex: v.colorHex || null,
              size: v.size || null,
              price: v.price ? parseFloat(v.price) : 0,
              stock: v.stock ? parseInt(v.stock) : 0,
              sortOrder: i,
            })),
          } : undefined,
        },
      })
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
  } catch (error: any) {
    console.error('Admin product DELETE error:', error)
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: 'Produk tidak bisa dihapus karena sudah memiliki riwayat pesanan (Order). Silakan edit produk dan ubah status menjadi Nonaktif.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
