import { Suspense } from 'react'
import { BannerCarousel } from '@/components/store/BannerCarousel'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Truck,
  RefreshCcw,
  Lock,
  HeadphonesIcon,
  Play,
  Users,
  Package,
  Star,
  ShieldCheck
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/store/ProductCard'
import { BrandVideo } from '@/components/store/BrandVideo'

export const dynamic = 'force-dynamic'

async function getHomepageData() {
  try {
    const [categoriesRaw, featuredProductsRaw, discountedRaw, recentProductsRaw, storeSettingsRaw] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, slug: { notIn: ['aksesoris'] } },
        orderBy: { sortOrder: 'asc' },
        select: { name: true, slug: true }
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          compareAtPrice: true,
          avgRating: true,
          reviewCount: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } }
        }
      }),
      prisma.product.findMany({
        where: { isActive: true, compareAtPrice: { gt: 0 } },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          compareAtPrice: true,
          avgRating: true,
          reviewCount: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } }
        }
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          compareAtPrice: true,
          avgRating: true,
          reviewCount: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } }
        }
      }),
      prisma.storeSetting.findMany({
        where: { key: { in: ['promoTitle', 'promoSubtitle'] } }
      })
    ])

    const storeSettings = storeSettingsRaw.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)

    const featuredProducts = featuredProductsRaw.length > 0 ? featuredProductsRaw : recentProductsRaw.slice(0, 5)
    const discounted = discountedRaw.length > 0 ? discountedRaw : recentProductsRaw.slice(5, 10)

    return { 
      categories: categoriesRaw, 
      featuredProducts,
      discounted,
      storeSettings
    }
  } catch (e) {
    console.error('[HOMEPAGE_DATA_ERROR]', e)
    return { categories: [], featuredProducts: [], discounted: [], storeSettings: {} }
  }
}

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen font-sans overflow-x-hidden">
      
      {/* ─── 1. HERO SECTION ──────────────── */}
      <section className="w-full relative overflow-hidden">
        {/* === MOBILE HERO === */}
        <div className="lg:hidden relative w-full aspect-[3/4] max-h-[520px] bg-[#0B0B0B]">
          <Image 
            src="https://i.imgur.com/1QtzAZ5.png"
            alt="Raxie Premium Collection" 
            fill
            className="object-cover object-center mix-blend-lighten opacity-80"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Content overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#B89A6A]" />
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#B89A6A] uppercase">KUALITAS PREMIUM</span>
            </div>
            <h1 className="font-serif text-[32px] leading-[1.05] font-extrabold tracking-tight mb-3 text-white">
              Didesain<br/><span className="text-[#B89A6A]">Untuk Anda.</span>
            </h1>
            <p className="text-neutral-300 text-[11px] leading-[1.5] font-medium mb-5 max-w-[280px]">
              RAXIE menghadirkan produk premium dengan desain modern dan kualitas terbaik.
            </p>
            <div className="flex items-center gap-3">
              <Link 
                href="/products" 
                className="bg-white text-[#0B0B0B] text-[10px] font-bold py-3 px-5 flex items-center gap-2 rounded-full transition-colors active:scale-95"
              >
                Lihat Koleksi <ArrowRight className="w-3 h-3" />
              </Link>
              <Link 
                href="/about" 
                className="text-white text-[10px] font-bold py-3 px-4 flex items-center gap-1.5 border border-white/30 rounded-full"
              >
                Eksplorasi <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* === DESKTOP HERO === */}
        <div className="hidden lg:flex flex-row w-full min-h-[650px] items-stretch bg-[#F8F6F2] dark:bg-[#121212]">
          <div className="w-[45%] flex flex-col justify-center py-16 pl-16 xl:pl-32 pr-12 z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[2px] bg-[#B89A6A]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#B89A6A]">KUALITAS PREMIUM</span>
            </div>
            <h1 className="font-serif text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-[#0B0B0B] dark:text-white">
              Didesain<br/><span className="text-[#B89A6A]">Untuk Anda.</span>
            </h1>
            <p className="text-[#777777] dark:text-neutral-400 text-[14px] leading-relaxed max-w-[380px] font-medium mb-10">
              RAXIE menghadirkan produk premium dengan desain modern dan kualitas terbaik untuk menemani setiap langkahmu.
            </p>
            <div className="flex flex-row items-center gap-6">
              <Link href="/products" className="bg-[#0B0B0B] dark:bg-white text-white dark:text-[#0B0B0B] text-[12px] font-bold px-6 py-3.5 flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors rounded-sm">
                Lihat Koleksi <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/about" className="text-[#0B0B0B] dark:text-white text-[12px] font-bold flex items-center gap-2 hover:text-[#B89A6A] transition-colors">
                Eksplorasi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="w-[55%] relative z-0 flex items-stretch">
            <div className="w-full h-full bg-[#0B0B0B] [clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] shadow-2xl overflow-hidden relative">
              <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Raxie Wallet Premium" fill className="object-cover object-left mix-blend-lighten opacity-90" priority />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. STATS ──────────────── */}
      <section className="relative z-20">
        {/* Mobile Stats */}
        <div className="lg:hidden bg-[#0B0B0B] mx-4 -mt-6 rounded-2xl shadow-xl relative z-10">
          <div className="grid grid-cols-4 divide-x divide-neutral-800 py-5">
            {[
              { icon: <Users className="w-4 h-4" strokeWidth={1.5} />, val: '975+', label: 'Pelanggan' },
              { icon: <Package className="w-4 h-4" strokeWidth={1.5} />, val: '320+', label: 'Terjual' },
              { icon: <Star className="w-4 h-4" strokeWidth={1.5} />, val: '100%', label: 'Original' },
              { icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />, val: '98%', label: 'Kepuasan' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center px-1">
                <div className="text-neutral-500 mb-1.5">{s.icon}</div>
                <span className="text-[#B89A6A] text-[14px] font-serif font-extrabold leading-none">{s.val}</span>
                <span className="text-[7px] text-neutral-500 font-medium mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Stats */}
        <div className="hidden lg:block">
          <div className="container-raxie max-w-[1400px] mx-auto px-6 pb-24">
            <div className="flex flex-col xl:flex-row shadow-2xl">
              <div className="bg-[#151515] text-white flex-1 relative flex items-center min-h-[220px]">
                <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
                  OUR IMPACT
                </div>
                <div className="grid grid-cols-4 w-full relative z-10 py-14">
                  {[
                    { icon: <Users className="w-7 h-7" strokeWidth={1.5} />, val: '975+', label: 'Pelanggan Puas' },
                    { icon: <Package className="w-7 h-7" strokeWidth={1.5} />, val: '320+', label: 'Produk Terjual' },
                    { icon: <Star className="w-7 h-7" strokeWidth={1.5} />, val: '100%', label: 'Produk Original' },
                    { icon: <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />, val: '98%', label: 'Tingkat Kepuasan' },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center justify-center text-center px-4">
                      <div className="text-white mb-4">{s.icon}</div>
                      <h3 className="text-[#B89A6A] text-5xl font-serif font-extrabold mb-1">{s.val}</h3>
                      <p className="text-[12px] text-neutral-400 font-medium tracking-wide">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="hidden xl:block absolute right-[-50px] top-0 bottom-0 w-[51px] bg-[#151515] z-0" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
              </div>
              <div className="xl:w-auto flex xl:-ml-6 xl:-mt-10 xl:-mb-10 xl:relative z-20 overflow-x-auto pb-6 px-4 xl:px-0">
                <div className="flex gap-4 min-w-max xl:min-w-0 xl:items-center xl:h-full py-4">
                  {[
                    { icon: '💎', title: 'Material\nPremium' },
                    { icon: '📐', title: 'Desain\nModern' },
                    { icon: '🛡️', title: 'Kuat &\nTahan Lama' },
                    { icon: '🏷️', title: 'Jaminan Harga\nTerbaik' }
                  ].map((feature, i) => (
                    <div key={i} className="bg-white w-[140px] h-[160px] flex flex-col items-center justify-center text-center p-4 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] relative" style={{ clipPath: 'polygon(0 0, calc(100% - 25px) 0, 100% 25px, 100% 100%, 0 100%)' }}>
                      <div className="text-3xl mb-4 opacity-80 grayscale">{feature.icon}</div>
                      <p className="text-[11px] font-extrabold text-black whitespace-pre-line leading-relaxed">{feature.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-96" />}>
        <DynamicStoreContent />
      </Suspense>

      {/* ─── TRUST BAR ──────────────── */}
      <section className="py-6 lg:py-10 bg-white dark:bg-[#151515] border-y border-neutral-100 dark:border-neutral-800 mt-8 lg:mt-16">
        <div className="container-raxie">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 lg:gap-0 lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800 text-center">
            {[
              { icon: <Truck className="w-5 h-5 lg:w-7 lg:h-7" strokeWidth={1.5} />, title: 'Gratis Ongkir', sub: 'Min. belanja 150Rb' },
              { icon: <RefreshCcw className="w-5 h-5 lg:w-7 lg:h-7" strokeWidth={1.5} />, title: 'Retur Mudah', sub: 'Garansi 14 hari' },
              { icon: <Lock className="w-5 h-5 lg:w-7 lg:h-7" strokeWidth={1.5} />, title: 'Pembayaran Aman', sub: '100% terlindungi' },
              { icon: <HeadphonesIcon className="w-5 h-5 lg:w-7 lg:h-7" strokeWidth={1.5} />, title: 'Layanan 24/7', sub: 'Dukungan pelanggan' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 px-4 lg:px-6 justify-center">
                <div className="text-neutral-700 dark:text-neutral-400 shrink-0">{t.icon}</div>
                <div className="lg:text-left">
                  <h4 className="text-[11px] lg:text-[13px] font-extrabold text-black dark:text-white mb-0.5">{t.title}</h4>
                  <p className="text-[9px] lg:text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}



async function DynamicStoreContent() {
  const { featuredProducts, discounted, storeSettings } = await getHomepageData()
  
  const collectionCards = [
    { title: 'DOMPET', subtitle: 'Koleksi', image: 'https://i.imgur.com/X1YcH8c.jpeg', link: '/products?category=dompet' },
    { title: 'TAS', subtitle: 'Koleksi', image: 'https://i.imgur.com/Y6g6vrp.jpeg', link: '/products?category=tas' },
    { title: 'SABUK', subtitle: 'Koleksi', image: 'https://i.imgur.com/kF5yKip.jpeg', link: '/products?category=sabuk' },
  ]

  return (
    <>
      {/* ─── 3. EXPLORE COLLECTION ──────────────── */}
      <section className="py-6 lg:py-12">
        <div className="container-raxie">
          {/* Header Mobile Category Title */}
          <div className="flex lg:hidden items-center justify-between mb-4">
            <div>
              <span className="text-[#B89A6A] text-[9px] font-extrabold tracking-[0.2em] uppercase block mb-0.5">KATEGORI RAXIE</span>
              <h2 className="text-xl font-serif font-extrabold text-black dark:text-white uppercase tracking-tight">Kategori Pilihan</h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold text-[#B89A6A] flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 lg:mb-16 gap-10">
            {/* Header Desktop */}
            <div className="hidden lg:block max-w-[340px]">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-6 h-[2px] bg-[#C19A6B]" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500">EKSPLORASI KOLEKSI</span>
              </div>
              <h2 className="text-4xl lg:text-[42px] font-extrabold text-black dark:text-white leading-[1.1] tracking-tight">
                Produk Yang<br/>Meningkatkan Gaya Anda.
              </h2>
              <p className="text-neutral-500 text-[13px] mt-6 font-medium leading-relaxed">
                RAXIE menyediakan berbagai pilihan produk premium yang dirancang untuk melengkapi gaya hidup modern Anda.
              </p>
              <Link 
                href="/products" 
                className="mt-8 bg-[#121212] text-white text-[11px] font-bold tracking-wider px-7 py-3.5 flex items-center gap-3 hover:bg-black transition-colors w-fit uppercase rounded-sm"
              >
                Lihat Semua Koleksi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* The 3 Cards - Mobile Horizontal Carousel, Desktop Grid */}
            <div className="w-full lg:flex-1 relative">
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 sm:gap-6 pb-4 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible">
                {collectionCards.map((card, i) => (
                  <Link 
                    key={i} 
                    href={card.link} 
                    className="snap-center lg:snap-align-none shrink-0 w-[75%] sm:w-[45%] lg:w-auto group relative bg-white dark:bg-[#1A1A1A] flex flex-col p-4 overflow-hidden rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-neutral-100 dark:border-neutral-800 transition-all active:scale-[0.98] lg:active:scale-100"
                  >
                    <div className="w-full bg-[#F8F6F2] dark:bg-[#242424] rounded-[16px] aspect-[4/3] relative mb-8 flex items-center justify-center p-6">
                      <div className="relative w-full h-full">
                        <Image 
                          src={card.image} 
                          alt={card.title} 
                          fill 
                          className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply dark:mix-blend-normal" 
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 768px) 75vw, (max-width: 1024px) 45vw, 33vw"
                        />
                      </div>
                      
                      {/* Circular Overlapping Icon */}
                      <div className="absolute -bottom-5 left-4 w-10 h-10 bg-white dark:bg-[#121212] rounded-full flex items-center justify-center shadow-lg border border-neutral-100 dark:border-neutral-800 z-10">
                        {i === 0 ? (
                          <div className="w-4 h-3 rounded-[2px] border-[1.5px] border-[#B89A6A]" />
                        ) : i === 1 ? (
                          <div className="w-4 h-3.5 rounded-t-full border-[1.5px] border-[#B89A6A] border-b-0 relative after:absolute after:bottom-0 after:-left-1 after:-right-1 after:h-2 after:border-[1.5px] after:border-[#B89A6A] after:rounded-sm" />
                        ) : (
                          <div className="w-5 h-2 rounded-full border-[1.5px] border-[#B89A6A]" />
                        )}
                      </div>
                    </div>
                    
                    <div className="px-2 text-center pb-2">
                      <h3 className="text-[13px] font-extrabold text-[#0B0B0B] dark:text-white tracking-widest uppercase mb-1">{card.title}</h3>
                      <p className="text-[10px] text-neutral-500 font-bold flex items-center justify-center gap-1">
                        Lihat Koleksi <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Pagination Indicator (Mobile Only) */}
              <div className="flex lg:hidden items-center justify-center gap-1.5 mt-1 pb-2">
                <span className="w-6 h-[3px] bg-[#B89A6A] rounded-full" />
                <span className="w-4 h-[3px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                <span className="w-4 h-[3px] bg-neutral-300 dark:bg-neutral-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. BANNER GRID (NEW) ──────────────── */}
      <section className="py-4 lg:py-12">
        <div className="container-raxie">
          <BannerCarousel />
        </div>
      </section>

      {/* ─── 5. FEATURED RAIL (NEW) ──────────────── */}
      <section className="py-16">
        <div className="container-raxie">
          <div className="flex items-center justify-between mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[#C19A6B]" />
              <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-black dark:text-white uppercase">NEW ARRIVALS</h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold text-black dark:text-white flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 pb-4 scrollbar-hide md:grid md:grid-cols-3 xl:grid-cols-5 md:overflow-visible">
            {featuredProducts.map((product: any) => {
              const mappedProduct = {
                id: product.id,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.basePrice,
                compareAtPrice: product.compareAtPrice,
                image: product.images?.[0]?.url || '/placeholder.jpg',
                avgRating: product.avgRating,
                reviewCount: product.reviewCount,
                isBestSeller: false,
                isNew: false,
                stock: product.stock || 10,
                sku: product.sku || product.id,
              }
              return (
                <div key={`featured-${product.id}`} className="snap-center md:snap-align-none shrink-0 w-[78%] sm:w-[45%] md:w-auto">
                  <ProductCard product={mappedProduct} variant="clean" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── 6. DISCOUNT RAIL (NEW) ──────────────── */}
      <section className="py-8 pb-24">
        <div className="container-raxie">
          <div className="flex items-center justify-between mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-1">
                {storeSettings.promoSubtitle || 'SPECIAL DISCOUNT'}
              </span>
              <h2 className="text-2xl font-extrabold text-black dark:text-white">
                {storeSettings.promoTitle || 'Discount Up To 35% Off'}
              </h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold text-black dark:text-white flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 pb-4 scrollbar-hide md:grid md:grid-cols-3 xl:grid-cols-5 md:overflow-visible">
            {discounted.map((product: any) => {
              const mappedProduct = {
                id: product.id,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.basePrice,
                compareAtPrice: product.compareAtPrice,
                image: product.images?.[0]?.url || '/placeholder.jpg',
                avgRating: product.avgRating,
                reviewCount: product.reviewCount,
                isBestSeller: false,
                isNew: false,
                stock: product.stock || 10,
                sku: product.sku || product.id,
              }
              return (
                <div key={`disc-${product.id}`} className="snap-center md:snap-align-none shrink-0 w-[78%] sm:w-[45%] md:w-auto">
                  <ProductCard product={mappedProduct} variant="clean" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── 7. NEW ARRIVAL / BRAND STORY ──────────────── */}
      <section className="bg-[#121212] text-white w-full max-w-[1920px] mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:h-[480px]">
          {/* Left Text */}
          <div className="w-full lg:w-[45%] px-6 py-12 sm:p-12 lg:px-24 flex flex-col justify-center relative bg-gradient-to-br from-[#1A1A1A] to-[#121212]">
            <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 mb-6 uppercase">NEW ARRIVAL</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight leading-[1.1]">
              New Product<br/>
              <span className="text-[#C19A6B]">Is Here.</span>
            </h2>
            <p className="text-neutral-400 text-[13px] leading-relaxed max-w-[320px] mb-10 font-medium">
              Produk terbaru dengan kualitas premium dan desain eksklusif. Dapatkan sekarang sebelum kehabisan!
            </p>
            <Link 
              href="/products?sort=newest" 
              className="bg-[#C19A6B] text-white text-[12px] font-bold px-8 py-3.5 flex items-center gap-3 hover:bg-[#A38159] transition-colors w-fit rounded-sm shadow-lg"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
            
            {/* Faded background image */}
            <div className="absolute right-[-10%] bottom-[-20%] opacity-[0.03] pointer-events-none hidden md:block">
               <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Wallet Silhouette" width={400} height={400} className="object-contain" loading="lazy" decoding="async" />
            </div>
          </div>
          
          {/* Right Image / Video */}
          <div className="w-full lg:w-[55%] h-[400px] lg:h-full relative">
            <BrandVideo 
              videoUrl="https://i.imgur.com/4gy9tYa.mp4" 
              thumbnailUrl="https://i.imgur.com/gHgS61d.png" 
            />
          </div>
        </div>
      </section>
    </>
  )
}
