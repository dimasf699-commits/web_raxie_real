import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductSort } from '@/components/store/ProductSort'
import { Prisma } from '@prisma/client'

interface ProductGridProps {
  searchParams: {
    q?: string
    category?: string
    sort?: string
    page?: string
    minPrice?: string
    maxPrice?: string
  }
}

export async function ProductGrid({ searchParams }: ProductGridProps) {
  // Build Prisma where clause from searchParams
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  }

  // Keyword search
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
      { tags: { has: searchParams.q } },
    ]
  }

  // Category filter
  if (searchParams.category && searchParams.category.toLowerCase() !== 'semua produk') {
    where.category = {
      slug: { equals: searchParams.category.toLowerCase(), mode: 'insensitive' }
    }
  }

  // Price filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.basePrice = {}
    if (searchParams.minPrice) where.basePrice.gte = Number(searchParams.minPrice)
    if (searchParams.maxPrice) where.basePrice.lte = Number(searchParams.maxPrice)
  }

  // Build orderBy clause
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  switch (searchParams.sort) {
    case 'price-asc':  orderBy = { basePrice: 'asc' };  break
    case 'price-desc': orderBy = { basePrice: 'desc' }; break
    case 'newest':     orderBy = { createdAt: 'desc' }; break
    case 'best-seller': orderBy = { totalSold: 'desc' }; break
    case 'rating':     orderBy = { avgRating: 'desc' }; break
  }

  // Fetch products from database
  const dbProducts = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
      images:   { orderBy: { sortOrder: 'asc' }, take: 1 },
      category: true,
    },
  })

  // Map DB result to ProductCard shape
  const products = dbProducts.map((p) => {
    const firstVariant = p.variants[0]
    const firstImage   = p.images[0]
    return {
      id:             firstVariant?.id ?? p.id,
      productId:      p.id,
      name:           p.name,
      slug:           p.slug,
      price:          firstVariant?.price ?? p.basePrice,
      compareAtPrice: p.compareAtPrice,
      image:          firstImage?.url ?? '/placeholder.jpg',
      avgRating:      p.avgRating,
      reviewCount:    p.reviewCount,
      isBestSeller:   p.isBestSeller,
      isNew:          p.isNew,
      stock:          firstVariant?.stock ?? 0,
      sku:            firstVariant?.sku ?? '',
    }
  })

  return (
    <div>
      {/* Header / Sort */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{products.length}</span> produk
        </p>
        
        <ProductSort />
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <h3 className="text-lg font-semibold text-foreground">Tidak ada produk yang ditemukan</h3>
          <p className="text-muted-foreground mt-2">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

