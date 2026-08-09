import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  PackageCheck
} from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import { HeroSlider } from '@/components/store/HeroSlider'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // ISR revalidate every 60 seconds

const DEFAULT_CATEGORIES = [
  { name: 'DOMPET', href: '/products?category=dompet', image: 'https://i.imgur.com/X1YcH8c.jpeg' },
  { name: 'TAS', href: '/products?category=tas', image: 'https://i.imgur.com/Y6g6vrp.jpeg' },
  { name: 'BELT', href: '/products?category=sabuk', image: 'https://i.imgur.com/kF5yKip.jpeg' },
]

async function getHomepageData() {
  try {
    const [bestSellersRaw, categoriesRaw] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { totalSold: 'desc' },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          compareAtPrice: true,
          avgRating: true,
          reviewCount: true,
          isBestSeller: true,
          isNew: true,
          material: true,
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1, select: { id: true, price: true, stock: true, sku: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          category: { select: { name: true } }
        }
      }),
      prisma.category.findMany({
        where: { isActive: true, slug: { notIn: ['aksesoris'] } },
        orderBy: { sortOrder: 'asc' },
        select: { name: true, slug: true }
      })
    ])

    const format = (items: any[]) => items.map(p => {
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
        material: p.material ?? '',
      }
    })

    const catImageMap: Record<string, string> = {
      dompet: 'https://i.imgur.com/X1YcH8c.jpeg',
      tas: 'https://i.imgur.com/Y6g6vrp.jpeg',
      sabuk: 'https://i.imgur.com/kF5yKip.jpeg',
    }

    const categories = categoriesRaw.length > 0
      ? categoriesRaw.map(c => ({
          name: c.name.toUpperCase(),
          href: `/products?category=${c.slug}`,
          image: catImageMap[c.slug] || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'
        }))
      : DEFAULT_CATEGORIES

    const bestSellers = format(bestSellersRaw)

    return { bestSellers, categories }
  } catch (e) {
    console.error('[HOMEPAGE_DATA_ERROR]', e)
    return { bestSellers: [], categories: DEFAULT_CATEGORIES }
  }
}

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden font-sans">
      
      {/* ─── 1. HERO SLIDER CAROUSEL (FULL WIDTH BACKGROUND) ──────────────── */}
      <HeroSlider />

      {/* ─── 2. BRAND STATEMENT ───────────────────────────────────────── */}
      <section className="py-24 md:py-36 bg-background text-foreground flex items-center justify-center text-center px-6">
        <div className="max-w-4xl space-y-8">
          <span className="text-[#C19A6B] text-[10px] font-bold tracking-[0.3em] uppercase block">
            Esensi RAXIE
          </span>
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.15] text-balance">
            Mendefinisikan ulang kemewahan pria melalui presisi, material premium, dan desain yang tak lekang oleh waktu.
          </h2>
        </div>
      </section>

      <Suspense fallback={<StoreGridSkeleton />}>
        <DynamicStoreContent />
      </Suspense>

      {/* ─── 5. CRAFTSMANSHIP (50/50 SPLIT) ───────────────────────────────── */}
      <section className="bg-background text-foreground border-y border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Half */}
          <div className="relative aspect-square lg:aspect-auto lg:h-full bg-muted overflow-hidden">
            <Image
              src="https://i.imgur.com/1QtzAZ5.png"
              alt="Pengrajin RAXIE"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              className="object-cover"
            />
          </div>

          {/* Text Half */}
          <div className="flex flex-col justify-center px-8 py-20 md:p-24 lg:p-32 space-y-8">
            <span className="text-[#C19A6B] text-[10px] font-bold tracking-[0.2em] uppercase block">
              DEDIKASI KUALITAS
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground uppercase tracking-tight leading-[1.1]">
              DIBUAT DENGAN TINGKAT PRESISI YANG TINGGI
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Setiap dompet dan aksesoris RAXIE dirancang khusus menggunakan material PU Leather Premium pilihan. Kami menggabungkan estetika maskulin modern dengan ketahanan jangka panjang, memberikan rasa percaya diri di setiap langkah Anda.
            </p>
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border-b border-[#C19A6B] text-foreground hover:text-[#C19A6B] pb-1 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                PELAJARI LEBIH LANJUT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. MINIMAL TRUST BAR ─────────────────────────────── */}
      <section className="py-16 bg-[#070707] text-white">
        <div className="container-raxie">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 text-center divide-x divide-neutral-900">
            <div className="space-y-4 px-4">
              <Truck className="h-5 w-5 text-[#C19A6B] mx-auto" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">GRATIS ONGKIR</h3>
            </div>
            <div className="space-y-4 px-4">
              <ShieldCheck className="h-5 w-5 text-[#C19A6B] mx-auto" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">GARANSI 1 TAHUN</h3>
            </div>
            <div className="space-y-4 px-4">
              <PackageCheck className="h-5 w-5 text-[#C19A6B] mx-auto" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">PEMBAYARAN AMAN</h3>
            </div>
            <div className="space-y-4 px-4">
              <Zap className="h-5 w-5 text-[#C19A6B] mx-auto" />
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">FAST RESPONSE</h3>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

async function DynamicStoreContent() {
  const { bestSellers, categories } = await getHomepageData()

  return (
    <>
      {/* ─── 3. ASYMMETRIC FEATURED COLLECTIONS ────────────────────────────── */}
      {categories.length > 0 && (
        <section className="pb-24 bg-background">
          <div className="container-raxie">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 md:gap-4">
              {/* Main large item */}
              <Link href={categories[0].href} className="group lg:col-span-8 relative aspect-[4/5] lg:aspect-[4/3] bg-muted overflow-hidden block">
                <Image src={categories[0].image} alt={categories[0].name} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block text-[#C19A6B]">Koleksi Utama</span>
                  <h3 className="font-serif text-3xl md:text-5xl tracking-tight uppercase">{categories[0].name}</h3>
                </div>
              </Link>
              
              {/* Two stacked items */}
              {categories.length > 1 && (
                <div className="lg:col-span-4 flex flex-col gap-1 md:gap-4 h-full">
                   {categories.slice(1,3).map(cat => (
                     <Link key={cat.name} href={cat.href} className="group relative aspect-square lg:flex-1 bg-muted overflow-hidden block">
                       <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                       <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
                         <h3 className="font-serif text-2xl tracking-tight uppercase">{cat.name}</h3>
                       </div>
                     </Link>
                   ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── 4. BEST SELLERS RAIL ─────────────────────────────────────────── */}
      <section className="py-24 bg-secondary">
        <div className="container-raxie">
          <div className="flex flex-col items-center justify-center text-center mb-16 gap-4">
            <span className="text-[#C19A6B] text-[10px] font-bold tracking-[0.3em] uppercase block">
              Pilihan Favorit
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground uppercase tracking-tight">
              Produk Terlaris
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              href="/products"
              className="inline-block border border-foreground text-foreground hover:bg-foreground hover:text-background font-bold text-xs uppercase tracking-[0.2em] px-8 py-3.5 transition-all"
            >
              LIHAT SEMUA KOLEKSI
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function StoreGridSkeleton() {
  return (
    <div className="container-raxie py-24 space-y-16 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 aspect-[4/3] bg-muted" />
        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="flex-1 bg-muted" />
           <div className="flex-1 bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 bg-muted" />
        ))}
      </div>
    </div>
  )
}
