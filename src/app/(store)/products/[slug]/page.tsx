import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDetail } from '@/components/store/ProductDetail'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Helper to map DB product to the shape ProductDetail expects
async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      images:   { orderBy: { sortOrder: 'asc' } },
      reviews:  { 
        where: { isApproved: true }, 
        orderBy: { createdAt: 'desc' }, 
        take: 10,
        include: { user: true }
      },
    },
  })
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Produk Tidak Ditemukan' }

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? `Beli ${product.name} - dompet kulit premium Raxie.`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const dbProduct = await getProductBySlug(params.slug)

  if (!dbProduct) {
    notFound()
  }

  // Map to the shape that ProductDetail expects
  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    price: dbProduct.variants[0]?.price ?? dbProduct.basePrice,
    compareAtPrice: dbProduct.compareAtPrice,
    images: dbProduct.images.map(i => i.url),
    avgRating: dbProduct.avgRating,
    reviewCount: dbProduct.reviewCount,
    isBestSeller: dbProduct.isBestSeller,
    isNew: dbProduct.isNew,
    material: dbProduct.material ?? '',
    weight: dbProduct.weight ?? null,
    dimensions: dbProduct.dimensions ?? null,
    careInstructions: dbProduct.careInstructions ?? null,
    tags: dbProduct.tags,
    categorySlug: dbProduct.category.slug,
    categoryName: dbProduct.category.name,
    variants: dbProduct.variants.map(v => ({
      id: v.id,
      name: v.name,
      colorHex: v.colorHex ?? undefined,
      stock: v.stock,
      price: v.price,
    })),
    stock: dbProduct.variants.reduce((sum, v) => sum + v.stock, 0),
    sku: dbProduct.variants[0]?.sku ?? '',
    reviews: dbProduct.reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.body,
      createdAt: r.createdAt.toISOString(),
      userName: r.user?.name || 'Anonim',
    })),
  }

  // Fetch related products from the same category
  const relatedDbProducts = await prisma.product.findMany({
    where: {
      categoryId: dbProduct.categoryId,
      id: { not: dbProduct.id },
      isActive: true,
    },
    take: 4,
    include: {
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
      images:   { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
  })

  const relatedProducts = relatedDbProducts.map((p) => ({
    id: p.variants[0]?.id ?? p.id,
    productId: p.id,
    name: p.name,
    slug: p.slug,
    price: p.variants[0]?.price ?? p.basePrice,
    compareAtPrice: p.compareAtPrice,
    image: p.images[0]?.url ?? '/placeholder.jpg',
    avgRating: p.avgRating,
    reviewCount: p.reviewCount,
    isBestSeller: p.isBestSeller,
    isNew: p.isNew,
    stock: p.variants[0]?.stock ?? 0,
    sku: p.variants[0]?.sku ?? '',
  }))

  return (
    <div className="container-raxie py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Koleksi', href: '/products' },
          { label: product.categoryName, href: `/products?category=${product.categorySlug}` },
          { label: product.name },
        ]}
        className="mb-8"
      />

      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  )
}

