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

export const revalidate = 60 // ISR revalidate every 60 seconds

async function getHomepageData() {
  try {
    const [categoriesRaw, productsRaw] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, slug: { notIn: ['aksesoris'] } },
        orderBy: { sortOrder: 'asc' },
        select: { name: true, slug: true }
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 10,
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
      })
    ])
    
    // Fallback dummy products if db is empty
    const dummyProducts = Array.from({ length: 10 }).map((_, i) => ({
      id: `dummy-${i}`,
      name: `RAXIE Classic Wallet ${i + 1}`,
      slug: `product-${i}`,
      basePrice: 149000,
      compareAtPrice: i >= 5 ? 199000 : null,
      avgRating: 5.0,
      reviewCount: 126,
      images: [{ url: 'https://i.imgur.com/1QtzAZ5.png' }]
    }))

    const products = productsRaw.length > 0 ? productsRaw : dummyProducts
    
    return { 
      categories: categoriesRaw, 
      bestSellers: products.slice(0, 5),
      discounted: products.slice(5, 10).map(p => ({ ...p, compareAtPrice: p.basePrice * 1.35 })) // Force discount for demo
    }
  } catch (e) {
    console.error('[HOMEPAGE_DATA_ERROR]', e)
    return { categories: [], bestSellers: [], discounted: [] }
  }
}

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen font-sans overflow-x-hidden">
      
      {/* ─── 1. HERO SECTION ──────────────── */}
      <section className="w-full bg-[#FAF9F6] dark:bg-[#121212] overflow-hidden transition-colors">
        <div className="flex flex-row w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[650px] items-stretch">
          
          {/* Left Text */}
          <div className="w-[55%] lg:w-[45%] flex flex-col justify-center py-10 pl-5 pr-2 sm:pl-8 lg:py-16 lg:pl-16 xl:pl-32 lg:pr-12 z-10">
            <div className="flex items-center gap-2 mb-3 lg:mb-6">
              <span className="w-4 sm:w-6 lg:w-8 h-[1px] lg:h-[2px] bg-[#C19A6B]" />
              <span className="text-[8px] sm:text-[9px] lg:text-[11px] font-bold tracking-[0.1em] lg:tracking-[0.2em] text-[#C19A6B]">KUALITAS PREMIUM</span>
            </div>
            
            <h1 className="text-[26px] sm:text-4xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-3 lg:mb-6 text-black dark:text-white">
              Didesain<br/>
              <span className="text-[#C19A6B]">Untuk Anda.</span>
            </h1>
            
            <p className="text-neutral-500 text-[9px] sm:text-[11px] lg:text-[14px] leading-relaxed max-w-[380px] font-medium mb-6 lg:mb-10">
              RAXIE menghadirkan produk premium dengan desain modern dan kualitas terbaik untuk menemani setiap langkahmu.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-6">
              <Link 
                href="/products" 
                className="bg-[#0f0f0f] dark:bg-white text-white dark:text-black text-[10px] lg:text-[12px] font-bold px-4 sm:px-5 lg:px-8 py-2.5 sm:py-3 lg:py-4 flex items-center justify-center gap-2 lg:gap-3 hover:bg-black dark:hover:bg-neutral-200 transition-colors rounded-[6px] lg:rounded-sm w-[130px] sm:w-auto"
              >
                Lihat Koleksi <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </Link>
              <Link 
                href="/about" 
                className="text-black dark:text-white text-[10px] lg:text-[12px] font-bold flex items-center gap-1 sm:gap-2 hover:text-[#C19A6B] transition-colors px-1"
              >
                Eksplorasi <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
              </Link>
            </div>
          </div>
          
          {/* Right Image Container */}
          <div className="w-[45%] lg:w-[55%] relative z-0 flex items-stretch">
            <div className="w-full h-full bg-[#0f0f0f] rounded-bl-[30px] lg:rounded-none lg:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] shadow-2xl overflow-hidden relative">
              <Image 
                src="https://i.imgur.com/1QtzAZ5.png"
                alt="Raxie Wallet Premium" 
                fill
                className="object-cover object-center lg:object-left mix-blend-lighten opacity-90"
                priority
                fetchPriority="high"
                sizes="(max-width: 1024px) 45vw, 60vw"
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* ─── 2. STATS & FEATURES ──────────────── */}
      <section className="relative pb-24 z-20">
        <div className="container-raxie max-w-[1400px] mx-auto px-0 md:px-6">
          <div className="flex flex-col xl:flex-row shadow-2xl">
            {/* Dark Stats Box */}
            <div className="bg-[#151515] text-white flex-1 relative flex items-center min-h-[220px]">
              {/* Left rotated text */}
              <div className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[9px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
                OUR IMPACT
              </div>
              
              <div className="grid grid-cols-4 gap-0 py-8 lg:py-14 px-4 sm:px-8 lg:pl-28 lg:pr-16 w-full relative z-10 divide-x divide-neutral-800">
                <div className="flex flex-col items-center justify-center text-center px-2">
                  <Users className="w-5 h-5 lg:w-7 lg:h-7 text-neutral-400 mb-2 lg:mb-4" strokeWidth={1.5} />
                  <h3 className="text-[#C19A6B] text-xl sm:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">975+</h3>
                  <p className="text-[8px] sm:text-[12px] text-neutral-400 font-medium tracking-wide">Pelanggan Puas</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-2">
                  <Package className="w-5 h-5 lg:w-7 lg:h-7 text-neutral-400 mb-2 lg:mb-4" strokeWidth={1.5} />
                  <h3 className="text-[#C19A6B] text-xl sm:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">320+</h3>
                  <p className="text-[8px] sm:text-[12px] text-neutral-400 font-medium tracking-wide">Produk Terjual</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-2">
                  <Star className="w-5 h-5 lg:w-7 lg:h-7 text-neutral-400 mb-2 lg:mb-4" strokeWidth={1.5} />
                  <h3 className="text-[#C19A6B] text-xl sm:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">462+</h3>
                  <p className="text-[8px] sm:text-[12px] text-neutral-400 font-medium tracking-wide">Ulasan Bintang 5</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center px-2">
                  <ShieldCheck className="w-5 h-5 lg:w-7 lg:h-7 text-neutral-400 mb-2 lg:mb-4" strokeWidth={1.5} />
                  <h3 className="text-[#C19A6B] text-xl sm:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">98%</h3>
                  <p className="text-[8px] sm:text-[12px] text-neutral-400 font-medium tracking-wide">Tingkat Kepuasan</p>
                </div>
              </div>
              
              {/* The angled cut on the right side of the black box for large screens */}
              <div 
                className="hidden xl:block absolute right-[-50px] top-0 bottom-0 w-[51px] bg-[#151515] z-0"
                style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
              />
            </div>
            
            {/* Features Cards (overlapping or adjacent) */}
            <div className="xl:w-auto flex xl:-ml-6 xl:-mt-10 xl:-mb-10 xl:relative z-20 overflow-x-auto pb-6 px-4 xl:px-0">
              <div className="flex gap-4 min-w-max xl:min-w-0 xl:items-center xl:h-full py-4">
                {[
                  { icon: '💎', title: 'Material\nPremium' },
                  { icon: '📐', title: 'Desain\nModern' },
                  { icon: '🛡️', title: 'Kuat &\nTahan Lama' },
                  { icon: '🏷️', title: 'Jaminan Harga\nTerbaik' }
                ].map((feature, i) => (
                  <div 
                    key={i} 
                    className="bg-white w-[140px] h-[160px] flex flex-col items-center justify-center text-center p-4 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] relative"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 25px) 0, 100% 25px, 100% 100%, 0 100%)' }}
                  >
                    <div className="text-3xl mb-4 opacity-80 grayscale">{feature.icon}</div>
                    <p className="text-[11px] font-extrabold text-black whitespace-pre-line leading-relaxed">{feature.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-96" />}>
        <DynamicStoreContent />
      </Suspense>

      {/* ─── TRUST BAR ──────────────── */}
      <section className="py-10 bg-white border-y border-neutral-200 mt-16">
        <div className="container-raxie">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 lg:gap-0 lg:divide-x lg:divide-neutral-200 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <Truck className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Gratis Ongkir</h4>
                <p className="text-[11px] text-neutral-500 font-medium">Min. belanja 150Rb</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <RefreshCcw className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Retur Mudah</h4>
                <p className="text-[11px] text-neutral-500 font-medium">Garansi 14 hari</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <Lock className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Pembayaran Aman</h4>
                <p className="text-[11px] text-neutral-500 font-medium">100% terlindungi</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <HeadphonesIcon className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Layanan Pelanggan</h4>
                <p className="text-[11px] text-neutral-500 font-medium">Dukungan 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}



async function DynamicStoreContent() {
  const { bestSellers, discounted } = await getHomepageData()
  
  const collectionCards = [
    { title: 'DOMPET', subtitle: 'Koleksi', image: 'https://i.imgur.com/X1YcH8c.jpeg', link: '/products?category=dompet' },
    { title: 'TAS', subtitle: 'Koleksi', image: 'https://i.imgur.com/Y6g6vrp.jpeg', link: '/products?category=tas' },
    { title: 'SABUK', subtitle: 'Koleksi', image: 'https://i.imgur.com/kF5yKip.jpeg', link: '/products?category=sabuk' },
  ]

  return (
    <>
      {/* ─── 3. EXPLORE COLLECTION ──────────────── */}
      <section className="py-12 pb-24">
        <div className="container-raxie">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-10">
            {/* Header */}
            <div className="max-w-[340px]">
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
            <div className="w-full lg:flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 sm:gap-6 pb-4 scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible">
              {collectionCards.map((card, i) => (
                <Link 
                  key={i} 
                  href={card.link} 
                  className="snap-start lg:snap-align-none shrink-0 w-[65%] sm:w-[45%] lg:w-auto group relative bg-[#F4F4F4] aspect-[4/5] sm:aspect-auto sm:h-[340px] flex flex-col justify-end p-0 overflow-hidden shadow-sm rounded-[20px] border border-[#E5E5E5] dark:border-border transition-all active:scale-[0.98] lg:active:scale-100"
                >
                  <div className="absolute inset-0 pb-16 pt-8 px-6">
                    <div className="relative w-full h-full">
                      <Image 
                        src={card.image} 
                        alt={card.title} 
                        fill 
                        className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply" 
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 65vw, (max-width: 1024px) 45vw, 33vw"
                      />
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-end p-5 lg:p-6 bg-gradient-to-t from-[#F4F4F4] dark:from-neutral-900 via-[#F4F4F4]/80 dark:via-neutral-900/80 to-transparent">
                    <div>
                      <h3 className="text-base lg:text-lg font-extrabold text-black dark:text-white tracking-tight">{card.title}</h3>
                      <p className="text-[10px] lg:text-[11px] text-neutral-500 font-medium">{card.subtitle}</p>
                    </div>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#B8926A] text-white flex items-center justify-center shrink-0 group-hover:bg-[#967654] transition-colors rounded-[10px] lg:rounded-[12px] shadow-md">
                      <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. BANNER GRID (NEW) ──────────────── */}
      <section className="py-12">
        <div className="container-raxie">
          <BannerCarousel />
        </div>
      </section>

      {/* ─── 5. BEST SELLER RAIL (NEW) ──────────────── */}
      <section className="py-16">
        <div className="container-raxie">
          <div className="flex items-center justify-between mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[#C19A6B]" />
              <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-black dark:text-white uppercase">BEST SELLER</h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold text-black dark:text-white flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 pb-4 scrollbar-hide md:grid md:grid-cols-3 xl:grid-cols-5 md:overflow-visible">
            {bestSellers.map((product: any) => {
              const mappedProduct = {
                id: product.id,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.basePrice,
                compareAtPrice: product.compareAtPrice,
                image: product.images?.[0]?.url || '/placeholder.jpg',
                avgRating: product.avgRating || 5,
                reviewCount: product.reviewCount || 0,
                isBestSeller: true,
                isNew: false,
                stock: product.stock || 10,
                sku: product.sku || product.id,
              }
              return (
                <div key={`best-${product.id}`} className="snap-center md:snap-align-none shrink-0 w-[78%] sm:w-[45%] md:w-auto">
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
              <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-1">SPECIAL DISCOUNT</span>
              <h2 className="text-2xl font-extrabold text-black dark:text-white">Discount Up To 35% Off</h2>
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
                avgRating: product.avgRating || 5,
                reviewCount: product.reviewCount || 0,
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
