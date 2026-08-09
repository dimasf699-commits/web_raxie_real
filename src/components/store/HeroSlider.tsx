'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

import { ChevronLeft, ChevronRight, Award, ShieldCheck, PackageCheck, Zap, Sparkles, Box, PhoneCall, Info } from 'lucide-react'

interface Slide {
  id: number
  bgImage: string
  subtitle: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  badges?: { icon: any; title: string; desc: string }[]
}

const SLIDES: Slide[] = [
  {
    id: 1,
    bgImage: 'https://i.imgur.com/1QtzAZ5.png',
    subtitle: 'DOMPET & AKSESORIS PREMIUM',
    title: 'KULIT SINTETIS PREMIUM',
    description: 'Miliki dompet dan aksesoris PU Leather premium dari RAXIE. Didesain maskulin, presisi, dan siap melengkapi gaya hidup Anda.',
    buttonText: 'BELI SEKARANG',
    buttonLink: '/products',
  },
  {
    id: 2,
    bgImage: 'https://i.imgur.com/Svs7CVN.png',
    subtitle: 'HERITAGE & DEDIKASI BRAND',
    title: 'TENTANG BRAND RAXIE',
    description: 'Pelajari dedikasi dan perjalanan RAXIE dalam menciptakan produk kulit sintetis berkualitas tinggi dengan standar presisi eksklusif.',
    buttonText: 'TENTANG KAMI',
    buttonLink: '/about',
  },
  {
    id: 3,
    bgImage: 'https://i.imgur.com/mirNk7x.png',
    subtitle: 'PUSAT BANTUAN 24/7',
    title: 'HUBUNGI TIM RAXIE',
    description: 'Ada pertanyaan seputar produk atau pesanan Anda? Tim Layanan Pelanggan RAXIE siap memberikan bantuan dengan cepat dan ramah.',
    buttonText: 'KONTAK KAMI',
    buttonLink: '/contact',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [visitedSlides, setVisitedSlides] = useState<Set<number>>(() => new Set([0]))

  useEffect(() => {
    // Record visited slides to defer non-LCP background image downloads
    setVisitedSlides((prev) => {
      if (prev.has(current)) return prev
      const next = new Set(prev)
      next.add(current)
      return next
    })
  }, [current])

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)

  const activeSlide = SLIDES[current]

  return (
    <section 
      className="relative w-full aspect-[16/7] min-h-[380px] sm:min-h-[460px] md:min-h-[520px] max-h-[680px] bg-black text-white overflow-hidden border-b border-neutral-900 flex items-center transform-gpu"
      role="region" 
      aria-roledescription="carousel" 
      aria-label="Koleksi Utama"
    >
      {/* 100% Crisp Uncropped Background Image Carousel */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {SLIDES.map((slide, idx) => {
          const shouldRenderImage = idx === 0 || visitedSlides.has(idx)
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out transform-gpu ${
                current === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {shouldRenderImage && (
                <Image
                  src={slide.bgImage}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  className="object-contain md:object-cover object-center"
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Content Container (Pushed tightly to left with clear readable badges & CTA) */}
      <div className="w-full relative z-10 py-10 md:py-16 px-6 sm:px-12 lg:px-20">
        <div className="relative" role="group" aria-roledescription="slide" aria-label={`Slide ${current + 1} dari ${SLIDES.length}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSlide.id}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-md lg:max-w-xl space-y-4 md:space-y-5"
            >
              {/* Tag / Subtitle */}
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C19A6B] animate-pulse" />
                <span className="text-[#C19A6B] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">
                  {activeSlide.subtitle}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-7xl font-normal text-white tracking-[-0.02em] leading-[1.05] uppercase">
                {activeSlide.title}
              </h1>

              {/* Description */}
              <p className="text-neutral-300 text-sm sm:text-base max-w-lg leading-relaxed font-normal hidden sm:block">
                {activeSlide.description}
              </p>

              {/* Single Specific Action Button */}
              <div className="pt-4">
                <Link
                  href={activeSlide.buttonLink}
                  className="inline-block bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-[0.2em] px-8 py-3.5 transition-all hover:scale-105"
                >
                  {activeSlide.buttonText}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 hover:text-white hover:bg-black hover:border-white transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Slide selanjutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 hover:text-white hover:bg-black hover:border-white transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full border border-white/10">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all ${
              current === idx
                ? 'w-6 h-2 bg-[#C19A6B] rounded-full'
                : 'w-2 h-2 bg-neutral-600 hover:bg-neutral-400 rounded-full'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
