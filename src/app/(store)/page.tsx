import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Truck,
  RefreshCcw,
  Lock,
  HeadphonesIcon,
  Play,
  Star
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

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
    <div className="bg-[#FAF9F6] text-black min-h-screen font-sans overflow-x-hidden">
      
      {/* ─── 1. HERO SECTION ──────────────── */}
      <section className="relative w-full bg-[#FAF9F6] flex flex-col lg:flex-row items-stretch lg:min-h-[650px] overflow-hidden">
        
        {/* Left Text */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center py-16 px-6 lg:pl-16 xl:pl-32 lg:pr-12 z-10 relative">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-[2px] bg-[#C19A6B]" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#C19A6B]">PREMIUM QUALITY</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-black">
            Designed<br/>
            <span className="text-[#C19A6B]">For You.</span>
          </h1>
          
          <p className="text-neutral-500 text-[14px] leading-relaxed max-w-[380px] mb-10 font-medium">
            RAXIE menghadirkan produk premium dengan desain modern dan kualitas terbaik untuk menemani setiap langkahmu.
          </p>
          
          <div className="flex items-center gap-6 flex-wrap">
            <Link 
              href="/products" 
              className="bg-[#121212] text-white text-[12px] font-bold px-8 py-4 flex items-center gap-3 hover:bg-black transition-colors rounded-sm"
            >
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/about" 
              className="text-black text-[12px] font-bold flex items-center gap-2 hover:text-[#C19A6B] transition-colors"
            >
              Explore More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Right Image Container - Clipped Diagonally */}
        <div className="w-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[60%] h-[400px] lg:h-full z-0">
          <div className="relative w-full h-full lg:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] bg-[#121212]">
            <Image 
              src="https://i.imgur.com/1QtzAZ5.png"
              alt="Raxie Wallet Premium" 
              fill
              className="object-cover object-center lg:object-left mix-blend-lighten"
              priority
            />
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 py-14 px-8 lg:pl-28 lg:pr-16 w-full relative z-10">
                <div>
                  <h3 className="text-[#C19A6B] text-4xl lg:text-5xl font-extrabold mb-3">975+</h3>
                  <p className="text-[12px] text-neutral-400 font-semibold tracking-wide">Happy Customers</p>
                </div>
                <div>
                  <h3 className="text-[#C19A6B] text-4xl lg:text-5xl font-extrabold mb-3">320+</h3>
                  <p className="text-[12px] text-neutral-400 font-semibold tracking-wide">Products Sold</p>
                </div>
                <div>
                  <h3 className="text-[#C19A6B] text-4xl lg:text-5xl font-extrabold mb-3">462+</h3>
                  <p className="text-[12px] text-neutral-400 font-semibold tracking-wide">5 Star Reviews</p>
                </div>
                <div>
                  <h3 className="text-[#C19A6B] text-4xl lg:text-5xl font-extrabold mb-3">98%</h3>
                  <p className="text-[12px] text-neutral-400 font-semibold tracking-wide">Satisfaction Rate</p>
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
                  { icon: '💎', title: 'Premium\nMaterial' },
                  { icon: '📐', title: 'Modern\nDesign' },
                  { icon: '🛡️', title: 'Durable &\nLong Lasting' },
                  { icon: '🏷️', title: 'Best Price\nGuarantee' }
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
                <h4 className="text-[13px] font-extrabold text-black mb-1">Free Shipping</h4>
                <p className="text-[11px] text-neutral-500 font-medium">Min. purchase 150K</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <RefreshCcw className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Easy Return</h4>
                <p className="text-[11px] text-neutral-500 font-medium">14 days return</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <Lock className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Secure Payment</h4>
                <p className="text-[11px] text-neutral-500 font-medium">100% protected</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 px-6 justify-center">
              <HeadphonesIcon className="w-7 h-7 text-neutral-800 shrink-0" strokeWidth={1.5} />
              <div>
                <h4 className="text-[13px] font-extrabold text-black mb-1">Customer Support</h4>
                <p className="text-[11px] text-neutral-500 font-medium">24/7 support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductCardLayout({ product }: { product: any }) {
  const formatPrice = (p: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p)
  
  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col">
      <div className="bg-[#F5F5F5] aspect-square relative mb-4 rounded-sm overflow-hidden flex items-center justify-center p-6">
        {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
          <div className="absolute top-2 left-2 bg-[#C19A6B] text-white text-[10px] font-bold px-2 py-1 rounded-sm z-10">
            -{Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)}%
          </div>
        )}
        <div className="relative w-full h-full mix-blend-multiply">
          <Image src={product.images[0]?.url || '/placeholder.jpg'} alt={product.name} fill className="object-contain group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
      <div>
        <h3 className="text-[13px] font-extrabold text-black mb-1 truncate">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-[#C19A6B] text-[#C19A6B]" />
          ))}
          <span className="text-[10px] text-neutral-500 ml-1">({product.reviewCount || 48})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-black">{formatPrice(product.basePrice)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="text-[11px] text-neutral-400 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

async function DynamicStoreContent() {
  const { bestSellers, discounted } = await getHomepageData()
  
  const collectionCards = [
    { title: 'WALLET', subtitle: 'Collection', image: 'https://i.imgur.com/X1YcH8c.jpeg', link: '/products?category=dompet' },
    { title: 'BAG', subtitle: 'Collection', image: 'https://i.imgur.com/Y6g6vrp.jpeg', link: '/products?category=tas' },
    { title: 'BELT', subtitle: 'Collection', image: 'https://i.imgur.com/kF5yKip.jpeg', link: '/products?category=sabuk' },
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
                <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500">EXPLORE COLLECTION</span>
              </div>
              <h2 className="text-4xl lg:text-[42px] font-extrabold text-black leading-[1.1] tracking-tight">
                Product That<br/>Elevates Your Style.
              </h2>
              <p className="text-neutral-500 text-[13px] mt-6 font-medium leading-relaxed">
                RAXIE menyediakan berbagai pilihan produk premium yang dirancang untuk melengkapi gaya hidup modern Anda.
              </p>
              <Link 
                href="/products" 
                className="mt-8 bg-[#121212] text-white text-[11px] font-bold tracking-wider px-7 py-3.5 flex items-center gap-3 hover:bg-black transition-colors w-fit uppercase rounded-sm"
              >
                View All Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* The 3 Cards */}
            <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {collectionCards.map((card, i) => (
                <Link key={i} href={card.link} className="group relative bg-[#F4F4F4] aspect-[4/5] sm:aspect-auto sm:h-[340px] flex flex-col justify-end p-0 overflow-hidden shadow-sm rounded-sm">
                  <div className="absolute inset-0 pb-16 pt-8 px-6">
                    <div className="relative w-full h-full">
                      <Image 
                        src={card.image} 
                        alt={card.title} 
                        fill 
                        className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply" 
                      />
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between items-end p-6 bg-gradient-to-t from-[#F4F4F4] via-[#F4F4F4]/80 to-transparent">
                    <div>
                      <h3 className="text-lg font-extrabold text-black tracking-tight">{card.title}</h3>
                      <p className="text-[11px] text-neutral-500 font-medium">{card.subtitle}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#B8926A] text-white flex items-center justify-center shrink-0 group-hover:bg-[#967654] transition-colors rounded-sm shadow-md">
                      <ArrowRight className="w-4 h-4" />
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
          <div className="flex flex-col md:flex-row h-auto md:h-[300px]">
            {/* Banner 1 */}
            <div className="flex-1 bg-[#E8F0F8] relative p-10 flex flex-col justify-center overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_0,100%_0,calc(100%-40px)_100%,0_100%)] z-20">
              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 mb-2 uppercase">DOMPET PRIA</span>
              <h3 className="text-3xl font-extrabold text-black leading-tight max-w-[200px] mb-6">Simple Looks Bigger Impact.</h3>
              <Link href="/products?category=dompet" className="text-[11px] font-bold text-black flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
                Lihat Koleksi <ArrowRight className="w-3 h-3" />
              </Link>
              {/* Image Placeholder */}
              <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[250px] h-[250px] mix-blend-multiply opacity-50 pointer-events-none">
                <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Dompet Pria" fill className="object-contain" />
              </div>
            </div>
            
            {/* Banner 2 */}
            <div className="flex-1 bg-[#F5E6DE] relative p-10 flex flex-col justify-center overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_0,100%_0,calc(100%-40px)_100%,40px_100%)] md:-ml-[40px] z-10 pl-[40px] md:pl-[80px]">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#A67C52] mb-2 uppercase">DOMPET WANITA</span>
              <h3 className="text-3xl font-extrabold text-black leading-tight max-w-[200px] mb-6">Elegan di Setiap Langkah.</h3>
              <Link href="/products?category=dompet" className="text-[11px] font-bold text-black flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
                Lihat Koleksi <ArrowRight className="w-3 h-3" />
              </Link>
              {/* Image Placeholder */}
              <div className="absolute right-[-10%] bottom-0 w-[200px] h-[200px] mix-blend-multiply opacity-50 pointer-events-none">
                <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Dompet Wanita" fill className="object-contain" />
              </div>
            </div>
            
            {/* Banner 3 */}
            <div className="flex-1 bg-[#151515] text-white relative p-10 flex flex-col justify-center overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_0,100%_0,100%_100%,40px_100%)] md:-ml-[40px] pl-[40px] md:pl-[80px]">
              <span className="text-[11px] font-bold tracking-[0.3em] text-white mb-4 uppercase">RAXIE</span>
              <h3 className="text-2xl font-extrabold text-white leading-tight max-w-[220px] mb-4">CRAFTED FOR A BETTER TOMORROW</h3>
              <p className="text-[10px] text-neutral-400 font-medium mb-6">Kualitas, gaya, & fungsi dalam satu produk.</p>
              {/* Image Placeholder */}
              <div className="absolute right-0 bottom-0 top-0 w-[50%] opacity-40 pointer-events-none">
                <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Crafted" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BEST SELLER RAIL (NEW) ──────────────── */}
      <section className="py-16">
        <div className="container-raxie">
          <div className="flex items-center justify-between mb-10 border-b border-neutral-200 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-[2px] bg-[#C19A6B]" />
              <h2 className="text-[11px] font-extrabold tracking-[0.2em] text-black uppercase">BEST SELLER</h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold text-black flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {bestSellers.map((product: any) => (
              <ProductCardLayout key={`best-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. DISCOUNT RAIL (NEW) ──────────────── */}
      <section className="py-8 pb-24">
        <div className="container-raxie">
          <div className="flex items-center justify-between mb-10 border-b border-neutral-200 pb-4">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase mb-1">SPECIAL DISCOUNT</span>
              <h2 className="text-2xl font-extrabold text-black">Discount Up To 35% Off</h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold text-black flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {discounted.map((product: any) => (
              <ProductCardLayout key={`disc-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. NEW ARRIVAL / BRAND STORY ──────────────── */}
      <section className="bg-[#121212] text-white w-full max-w-[1920px] mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:h-[480px]">
          {/* Left Text */}
          <div className="w-full lg:w-[45%] p-12 lg:px-24 flex flex-col justify-center relative bg-gradient-to-br from-[#1A1A1A] to-[#121212]">
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
               <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Wallet Silhouette" width={400} height={400} className="object-contain" />
            </div>
          </div>
          
          {/* Right Image */}
          <div className="w-full lg:w-[55%] h-[400px] lg:h-full relative bg-neutral-900 group cursor-pointer overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1470" // Guy walking with bag placeholder
              alt="Brand Story"
              fill
              className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500 group-hover:scale-105 transform-gpu grayscale"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-white/40 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors mb-4 shadow-xl">
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
              <span className="text-white text-[11px] font-bold tracking-[0.2em] text-center uppercase">
                Watch<br/>Brand Story
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
