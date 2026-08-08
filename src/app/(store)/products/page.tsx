import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { FilterSidebar } from '@/components/store/FilterSidebar'
import { InfiniteProductGrid } from '@/components/store/InfiniteProductGrid'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Koleksi Produk | Raxie',
  description: 'Jelajahi koleksi dompet dan aksesoris kulit premium dari Raxie.',
}

const LIMIT = 8

interface ProductsPageProps {
  searchParams: {
    q?: string
    category?: string
    sort?: string
    page?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const q = searchParams.q || ''
  const category = searchParams.category || 'KOLEKSI PRODUK'

  // Build Prisma where clause for initial SSR load
  const where: Prisma.ProductWhereInput = { isActive: true }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { has: q } },
    ]
  }

  if (searchParams.category && searchParams.category.toLowerCase() !== 'semua produk') {
    where.category = {
      slug: { equals: searchParams.category.toLowerCase(), mode: 'insensitive' }
    }
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.basePrice = {}
    if (searchParams.minPrice) where.basePrice.gte = Number(searchParams.minPrice)
    if (searchParams.maxPrice) where.basePrice.lte = Number(searchParams.maxPrice)
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  switch (searchParams.sort) {
    case 'price-asc':   orderBy = { basePrice: 'asc' }; break
    case 'price-desc':  orderBy = { basePrice: 'desc' }; break
    case 'newest':      orderBy = { createdAt: 'desc' }; break
    case 'best-seller': orderBy = { totalSold: 'desc' }; break
    case 'rating':      orderBy = { avgRating: 'desc' }; break
  }

  // Fetch first page of products (SSR)
  const dbProducts = await prisma.product.findMany({
    where,
    orderBy,
    take: LIMIT + 1,
    include: {
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
      images:   { orderBy: { sortOrder: 'asc' }, take: 1 },
      category: true,
    },
  })

  const hasMore = dbProducts.length > LIMIT
  const slice = hasMore ? dbProducts.slice(0, LIMIT) : dbProducts
  const nextCursor = hasMore ? slice[slice.length - 1].id : null

  // Map to ProductCard shape
  const initialProducts = slice.map(p => {
    const v = p.variants[0]
    const img = p.images[0]
    return {
      id: v?.id ?? p.id,
      productId: p.id,
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
    }
  })

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#0B0A08] py-12 border-b border-neutral-900">
        <div className="container-raxie">
          <Breadcrumbs
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Koleksi', href: '/products' },
              ...(searchParams.category ? [{ label: searchParams.category, href: `/products?category=${searchParams.category}` }] : []),
            ]}
          />
          <div className="mt-6 text-center max-w-xl mx-auto space-y-2">
            <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.2em] uppercase">
              RAXIE CATALOGUE
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold uppercase tracking-wider text-white">
              {q ? `PENCARIAN: "${q}"` : category}
            </h1>
            <p className="text-neutral-400 text-xs md:text-sm">
              Temukan dompet dan aksesoris kulit sintetis & asli bermutu tinggi untuk melengkapi gaya elegan Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="container-raxie py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Desktop (Filters) */}
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
            <FilterSidebar />
          </div>

          {/* Main Product Grid */}
          <div className="flex-1 w-full min-w-0">
            <InfiniteProductGrid
              searchParams={searchParams}
              initialProducts={initialProducts}
              initialCursor={nextCursor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
