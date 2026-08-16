import { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductDetail } from '@/components/store/ProductDetail'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: {
    slug: string
  }
}

// Deduplicated helper using React cache() to prevent duplicate DB calls during SSR
const getProductBySlug = cache(async (slug: string) => {
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
        include: { user: { select: { name: true, image: true } } }
      },
    },
  })
})

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Produk Tidak Ditemukan' }

  const fallbackTitle = `${product.name} - ${product.category?.name === 'Dompet' ? 'Dompet Kulit Pria' : product.category?.name ?? 'Aksesori Pria'} | RAXIE`
  const fallbackDesc = `Beli ${product.name} original dari RAXIE. ${product.category?.name === 'Dompet' ? 'Dompet kulit pria premium' : 'Produk premium'} dengan desain modern, tahan lama, dan harga terjangkau.`

  return {
    title: product.seoTitle ?? fallbackTitle,
    description: product.seoDescription ?? fallbackDesc,
    alternates: {
      canonical: `https://raxie.id/products/${product.slug}`
    },
    openGraph: {
      title: product.seoTitle ?? fallbackTitle,
      description: product.seoDescription ?? fallbackDesc,
      url: `https://raxie.id/products/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const dbProduct = await getProductBySlug(params.slug)

  if (!dbProduct) {
    // Attempt relaxed fuzzy match (ignoring hyphens/special chars) for old Google links
    const allProducts = await prisma.product.findMany({ select: { slug: true } })
    
    const normalize = (s: string) => s.replace(/[^a-z0-9]/g, '')
    const normalizedTarget = normalize(params.slug)
    
    const fuzzyMatch = allProducts.find(p => 
      normalize(p.slug).startsWith(normalizedTarget) || normalizedTarget.startsWith(normalize(p.slug).replace(/\d+$/, ''))
    )
    
    if (fuzzyMatch) {
      const { redirect } = await import('next/navigation')
      redirect(`/products/${fuzzyMatch.slug}`)
    }
    
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
    material: dbProduct.material,
    dimensions: dbProduct.dimensions,
    weight: dbProduct.weight,
    features: (dbProduct as any).features ?? [],
    sku: dbProduct.variants[0]?.sku ?? '',
    stock: dbProduct.variants[0]?.stock ?? 0,
    categoryName: dbProduct.category?.name ?? 'Kategori',
    variants: dbProduct.variants.map(v => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    })),
    reviews: dbProduct.reviews.map(r => ({
      id: r.id,
      userName: r.user?.name ?? 'Pembeli RAXIE',
      userAvatar: r.user?.image ?? null,
      rating: r.rating,
      comment: r.body,
      createdAt: r.createdAt.toISOString(),
    })),
  }

  // Related products from the same category
  const relatedRaw = await prisma.product.findMany({
    where: {
      categoryId: dbProduct.categoryId,
      id: { not: dbProduct.id },
      isActive: true,
    },
    take: 4,
    include: {
      variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
      images:   { orderBy: { sortOrder: 'asc' }, take: 1 },
      category: true,
    },
  })

  const relatedProducts = relatedRaw.map(p => {
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
      categoryName: p.category?.name ?? '',
    }
  })

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images[0] || 'https://raxie.id/og-image.jpg',
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'RAXIE',
    },
    offers: {
      '@type': 'Offer',
      url: `https://raxie.id/products/${product.slug}`,
      priceCurrency: 'IDR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'RAXIE Official Store',
      },
    },
    ...(product.avgRating > 0 && product.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avgRating,
        reviewCount: product.reviewCount,
      }
    } : {})
  }

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://raxie.id/' },
      { '@type': 'ListItem', position: 2, name: 'Koleksi', item: 'https://raxie.id/products' },
      { '@type': 'ListItem', position: 3, name: product.categoryName, item: `https://raxie.id/products?category=${product.categoryName.toLowerCase()}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `https://raxie.id/products/${product.slug}` },
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen py-10 transition-colors duration-300">
        <div className="container-raxie">
          <Breadcrumbs
            items={[
              { label: 'Koleksi', href: '/products' },
              { label: product.categoryName, href: `/products?category=${product.categoryName.toLowerCase()}` },
              { label: product.name, href: `#` },
            ]}
          />
          <div className="mt-6">
            <ProductDetail product={product} relatedProducts={relatedProducts} />
          </div>
        </div>
      </div>
    </>
  )
}
