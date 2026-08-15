'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    title: 'DOMPET PRIA',
    heading: 'Simple Looks Bigger Impact.',
    link: '/products?category=dompet',
    image: 'https://i.imgur.com/1QtzAZ5.png',
    bgClass: 'bg-[#E8F0F8] dark:bg-slate-900',
    titleClass: 'text-neutral-500',
    imgContainerClass: 'absolute right-[-20%] top-1/2 -translate-y-1/2 w-[250px] h-[250px] mix-blend-multiply dark:mix-blend-normal opacity-50 pointer-events-none',
  },
  {
    id: 2,
    title: 'DOMPET WANITA',
    heading: 'Elegan di Setiap Langkah.',
    link: '/products?category=dompet',
    image: 'https://i.imgur.com/1QtzAZ5.png',
    bgClass: 'bg-[#F5E6DE] dark:bg-stone-900',
    titleClass: 'text-[#A67C52]',
    imgContainerClass: 'absolute right-[-10%] bottom-0 w-[200px] h-[200px] mix-blend-multiply dark:mix-blend-normal opacity-50 pointer-events-none',
  },
  {
    id: 3,
    title: 'RAXIE',
    heading: 'CRAFTED FOR A BETTER TOMORROW',
    subtitle: 'Kualitas, gaya, & fungsi dalam satu produk.',
    link: null, // No link for this one in original design, but maybe we could add one? Original didn't have one.
    image: 'https://i.imgur.com/1QtzAZ5.png',
    bgClass: 'bg-[#151515] text-white',
    titleClass: 'text-white tracking-[0.3em]',
    imgContainerClass: 'absolute right-0 bottom-0 top-0 w-[50%] opacity-40 pointer-events-none',
    imageFillClass: 'object-cover',
  }
]

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scrollTo = useCallback((index: number) => {
    if (!scrollRef.current) return
    const width = scrollRef.current.clientWidth
    scrollRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }, [])

  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNERS.length
        if (scrollRef.current) {
          const width = scrollRef.current.clientWidth
          scrollRef.current.scrollTo({
            left: width * next,
            behavior: 'smooth'
          })
        }
        return next
      })
    }, 5000)
  }, [])

  const stopAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Handle scroll events to update dots when user swipes
  const handleScroll = () => {
    if (!scrollRef.current) return
    const width = scrollRef.current.clientWidth
    const scrollLeft = scrollRef.current.scrollLeft
    const newIndex = Math.round(scrollLeft / width)
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < BANNERS.length) {
      setActiveIndex(newIndex)
    }
  }

  useEffect(() => {
    startAutoSlide()
    return () => stopAutoSlide()
  }, [startAutoSlide])

  return (
    <>
      {/* MOBILE VIEW: Horizontal Carousel */}
      <div 
        className="block md:hidden relative w-full h-[320px] overflow-hidden group"
        onTouchStart={stopAutoSlide}
        onTouchEnd={startAutoSlide}
      >
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {BANNERS.map((banner) => (
            <div key={banner.id} className={`shrink-0 w-full h-full snap-center relative p-8 flex flex-col justify-center ${banner.bgClass}`}>
              <span className={`text-[10px] font-bold uppercase mb-2 ${banner.titleClass}`}>{banner.title}</span>
              <h3 className={`text-3xl font-extrabold leading-tight max-w-[200px] mb-4 ${banner.id === 3 ? 'text-white' : 'text-black dark:text-white'}`}>
                {banner.heading}
              </h3>
              
              {banner.subtitle && (
                <p className="text-[10px] text-neutral-400 font-medium mb-6">{banner.subtitle}</p>
              )}

              {banner.link && (
                <Link href={banner.link} className={`text-[11px] font-bold flex items-center gap-2 hover:opacity-70 transition-opacity ${banner.id === 3 ? 'text-white' : 'text-black dark:text-white'}`}>
                  Lihat Koleksi <ArrowRight className="w-3 h-3" />
                </Link>
              )}
              
              <div className={banner.imgContainerClass}>
                <Image 
                  src={banner.image} 
                  alt={banner.title} 
                  fill 
                  className={banner.imageFillClass || "object-contain"} 
                  loading="lazy" 
                  decoding="async" 
                  sizes="100vw" 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollTo(i)
                startAutoSlide() // reset timer
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-[#C19A6B] w-4' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP VIEW: Original Grid */}
      <div className="hidden md:flex flex-col md:flex-row h-auto md:h-[300px]">
        {/* Banner 1 */}
        <div className="flex-1 bg-[#E8F0F8] dark:bg-slate-900 relative p-10 flex flex-col justify-center overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_0,100%_0,calc(100%-40px)_100%,0_100%)] z-20">
          <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 mb-2 uppercase">DOMPET PRIA</span>
          <h3 className="text-3xl font-extrabold text-black dark:text-white leading-tight max-w-[200px] mb-6">Simple Looks Bigger Impact.</h3>
          <Link href="/products?category=dompet" className="text-[11px] font-bold text-black dark:text-white flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
            Lihat Koleksi <ArrowRight className="w-3 h-3" />
          </Link>
          <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[250px] h-[250px] mix-blend-multiply dark:mix-blend-normal opacity-50 pointer-events-none">
            <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Dompet Pria" fill className="object-contain" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        </div>
        
        {/* Banner 2 */}
        <div className="flex-1 bg-[#F5E6DE] dark:bg-stone-900 relative p-10 flex flex-col justify-center overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_0,100%_0,calc(100%-40px)_100%,40px_100%)] md:-ml-[40px] z-10 pl-[40px] md:pl-[80px]">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#A67C52] mb-2 uppercase">DOMPET WANITA</span>
          <h3 className="text-3xl font-extrabold text-black dark:text-white leading-tight max-w-[200px] mb-6">Elegan di Setiap Langkah.</h3>
          <Link href="/products?category=dompet" className="text-[11px] font-bold text-black dark:text-white flex items-center gap-2 hover:text-[#C19A6B] transition-colors">
            Lihat Koleksi <ArrowRight className="w-3 h-3" />
          </Link>
          <div className="absolute right-[-10%] bottom-0 w-[200px] h-[200px] mix-blend-multiply dark:mix-blend-normal opacity-50 pointer-events-none">
            <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Dompet Wanita" fill className="object-contain" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        </div>
        
        {/* Banner 3 */}
        <div className="flex-1 bg-[#151515] text-white relative p-10 flex flex-col justify-center overflow-hidden [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] md:[clip-path:polygon(0_0,100%_0,100%_100%,40px_100%)] md:-ml-[40px] pl-[40px] md:pl-[80px]">
          <span className="text-[11px] font-bold tracking-[0.3em] text-white mb-4 uppercase">RAXIE</span>
          <h3 className="text-2xl font-extrabold text-white leading-tight max-w-[220px] mb-4">CRAFTED FOR A BETTER TOMORROW</h3>
          <p className="text-[10px] text-neutral-400 font-medium mb-6">Kualitas, gaya, & fungsi dalam satu produk.</p>
          <div className="absolute right-0 bottom-0 top-0 w-[50%] opacity-40 pointer-events-none">
            <Image src="https://i.imgur.com/1QtzAZ5.png" alt="Crafted" fill className="object-cover" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" />
          </div>
        </div>
      </div>
    </>
  )
}
