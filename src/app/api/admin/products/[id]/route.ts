import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteCacheByPattern } from '@/lib/redis'

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
      // 1. Update Images safely
      if (body.images && Array.isArray(body.images)) {
        await tx.productImage.deleteMany({ where: { productId: params.id } })
        await tx.productImage.createMany({
          data: body.images.map((url: string, i: number) => ({
            productId: params.id,
            url,
            sortOrder: i,
          })),
        })
      }

      // 2. Safe Variant Management (Prevent Foreign Key Violation P2003 with OrderItem)
      if (body.variants && Array.isArray(body.variants)) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: params.id },
          include: { _count: { select: { orderItems: true } } },
        })

        const incomingSkus = new Set(body.variants.map((v: any) => v.sku).filter(Boolean))

        // Handle existing variants not in incoming payload
        for (const ev of existingVariants) {
          if (!incomingSkus.has(ev.sku)) {
            if (ev._count.orderItems > 0) {
              // Soft-deactivate to preserve historical order references
              await tx.productVariant.update({
                where: { id: ev.id },
                data: { isActive: false },
              })
            } else {
              // Safe to delete if never ordered
              await tx.productVariant.delete({ where: { id: ev.id } })
            }
          }
        }

        // Upsert incoming variants
        for (let i = 0; i < body.variants.length; i++) {
          const v = body.variants[i]
          const existing = existingVariants.find((ev) => ev.sku === v.sku || (v.id && ev.id === v.id))

          if (existing) {
            await tx.productVariant.update({
              where: { id: existing.id },
              data: {
                sku: v.sku,
                name: v.name || 'Default',
                color: v.color || null,
                colorHex: v.colorHex || null,
                size: v.size || null,
                price: v.price ? parseFloat(v.price) : 0,
                stock: v.stock !== undefined ? parseInt(v.stock, 10) : 0,
                sortOrder: i,
                isActive: true,
              },
            })
          } else {
            await tx.productVariant.create({
              data: {
                productId: params.id,
                sku: v.sku || `SKU-${Date.now()}-${i}`,
                name: v.name || 'Default',
                color: v.color || null,
                colorHex: v.colorHex || null,
                size: v.size || null,
                price: v.price ? parseFloat(v.price) : 0,
                stock: v.stock !== undefined ? parseInt(v.stock, 10) : 0,
                sortOrder: i,
                isActive: true,
              },
            })
          }
        }
      }

      // 3. Update Product Main Details
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
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { sortOrder: 'asc' } },
          category: true,
        },
      })
    })

    // Invalidate product public cache
    await deleteCacheByPattern('api:products:*')

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Admin product PUT error:', error)
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await prisma.product.delete({ where: { id: params.id } })
    await deleteCacheByPattern('api:products:*')
    return NextResponse.json({ message: 'Produk berhasil dihapus' })
  } catch (error: any) {
    console.error('Admin product DELETE error:', error)
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Produk tidak bisa dihapus karena sudah memiliki riwayat pesanan (Order). Silakan ubah status produk menjadi Nonaktif.' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
