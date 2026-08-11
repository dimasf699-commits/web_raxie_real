import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Truck,
  RefreshCcw,
  Lock,
  HeadphonesIcon,
  Play
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // ISR revalidate every 60 seconds

async function getHomepageData() {
  // Keep the fetch for compatibility, but we might only use specific bits
  try {
    const categoriesRaw = await prisma.category.findMany({
      where: { isActive: true, slug: { notIn: ['aksesoris'] } },
      orderBy: { sortOrder: 'asc' },
      select: { name: true, slug: true }
    })
    return { categories: categoriesRaw }
  } catch (e) {
    console.error('[HOMEPAGE_DATA_ERROR]', e)
    return { categories: [] }
  }
}

export default function HomePage() {
  return (
    <div className="bg-[#FAF9F6] text-black min-h-screen font-sans overflow-x-hidden">
      
      {/* ─── 1. HERO SECTION ──────────────── */}
      <section className="relative w-full overflow-hidden bg-[#FAF9F6] lg:min-h-[650px] flex items-center">
        {/* Diagonal split background for right side */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-[55%] bg-[#121212] z-0 hidden lg:block"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}
        />
        
        <div className="container-raxie relative z-10 w-full flex flex-col lg:flex-row items-center py-12 lg:py-24">
          {/* Left Text */}
          <div className="w-full lg:w-[45%] lg:pr-12">
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
            
            <div className="flex items-center gap-8">
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
          
          {/* Right Image */}
          <div className="w-full lg:w-[55%] mt-16 lg:mt-0 flex justify-center lg:justify-end relative h-[350px] lg:h-[500px]">
            <Image 
              src="https://i.imgur.com/1QtzAZ5.png"
              alt="Raxie Wallet Premium" 
              fill
              className="object-contain lg:object-cover object-center lg:object-right scale-110 lg:scale-125 origin-center lg:origin-right drop-shadow-2xl translate-x-0 lg:-translate-x-10"
              priority
            />
          </div>
        </div>
      </section>

      {/* ─── 2. STATS & FEATURES ──────────────── */}
      <section className="relative pt-16 pb-24 z-20">
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

      {/* ─── 5. TRUST BAR ──────────────── */}
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

async function DynamicStoreContent() {
  
  // Using static placeholders based on image for the 3 categories
  // In a real scenario, these could be mapped to actual product categories or specific featured products.
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
                <Link key={i} href={card.link} className="group relative bg-[#F4F4F4] aspect-[4/5] sm:aspect-auto sm:h-[340px] flex flex-col justify-end p-0 overflow-hidden shadow-sm">
                  {/* Image container to control the blend mode and hover scale */}
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
                  
                  {/* Text and Button Footer */}
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

      {/* ─── 4. NEW ARRIVAL / BRAND STORY ──────────────── */}
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
              src="https://i.imgur.com/Svs7CVN.png"
              alt="Brand Story"
              fill
              className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-500 group-hover:scale-105 transform-gpu"
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
