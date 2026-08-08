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
  badges: { icon: any; title: string; desc: string }[]
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
    badges: [
      { icon: Award, title: 'PREMIUM QUALITY', desc: 'Material Terbaik' },
      { icon: PackageCheck, title: 'KOMPARTEMEN LENGKAP', desc: 'Desain Fungsional' },
      { icon: Zap, title: 'RINGAN & NYAMAN', desc: 'Pemakaian Harian' },
      { icon: Box, title: 'BOX EKSKLUSIF', desc: 'Siap Hadiah' },
    ],
  },
  {
    id: 2,
    bgImage: 'https://i.imgur.com/Svs7CVN.png',
    subtitle: 'HERITAGE & DEDIKASI BRAND',
    title: 'TENTANG BRAND RAXIE',
    description: 'Pelajari dedikasi dan perjalanan RAXIE dalam menciptakan produk kulit sintetis berkualitas tinggi dengan standar presisi eksklusif.',
    buttonText: 'TENTANG KAMI',
    buttonLink: '/about',
    badges: [
      { icon: Info, title: 'BRAND ORIGINAL', desc: 'Desain Otentik' },
      { icon: Sparkles, title: 'CRAFTSMANSHIP', desc: 'Detail Jahitan Sempurna' },
      { icon: ShieldCheck, title: 'GARANSI 1 TAHUN', desc: 'Jaminan Resmi' },
    ],
  },
  {
    id: 3,
    bgImage: 'https://i.imgur.com/mirNk7x.png',
    subtitle: 'PUSAT BANTUAN 24/7',
    title: 'HUBUNGI TIM RAXIE',
    description: 'Ada pertanyaan seputar produk atau pesanan Anda? Tim Layanan Pelanggan RAXIE siap memberikan bantuan dengan cepat dan ramah.',
    buttonText: 'KONTAK KAMI',
    buttonLink: '/contact',
    badges: [
      { icon: PhoneCall, title: 'LAYANAN CEPAT', desc: 'Response Harian' },
      { icon: ShieldCheck, title: 'GRATIS ONGKIR', desc: 'Seluruh Indonesia' },
      { icon: Zap, title: 'PENGIRIMAN CEPAT', desc: 'Proses Langsung' },
    ],
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)

  const activeSlide = SLIDES[current]

  return (
    <section className="relative w-full aspect-[16/7] min-h-[380px] sm:min-h-[460px] md:min-h-[520px] max-h-[680px] bg-black text-white overflow-hidden border-b border-neutral-900 flex items-center">
      {/* 100% Crisp Uncropped Background Image Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={activeSlide.bgImage}
            alt={activeSlide.title}
            fill
            priority={activeSlide.id === 1}
            sizes="100vw"
            className="object-contain md:object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content Container (Pushed tightly to left with clear readable badges & CTA) */}
      <div className="w-full relative z-10 py-10 md:py-16 px-6 sm:px-12 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-md lg:max-w-xl space-y-4 md:space-y-5"
          >
            {/* Tag / Subtitle */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#C19A6B]/50 bg-black/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B] animate-pulse" />
              <span className="text-[#C19A6B] text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">
                {activeSlide.subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-[1.1] uppercase drop-shadow-md">
              {activeSlide.title}
            </h1>

            {/* Description */}
            <p className="text-neutral-200 text-xs sm:text-sm max-w-md leading-relaxed font-normal drop-shadow hidden sm:block">
              {activeSlide.description}
            </p>

            {/* Single Specific Action Button */}
            <div className="pt-1">
              <Link
                href={activeSlide.buttonLink}
                className="inline-block bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-[0.15em] px-7 py-3 rounded shadow-xl transition-all hover:scale-105"
              >
                {activeSlide.buttonText}
              </Link>
            </div>

            {/* Sub-Badges (Clean solid background without blur) */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-neutral-800/80 max-w-md hidden sm:grid">
              {activeSlide.badges.map((badge, idx) => {
                const IconComponent = badge.icon
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-neutral-700 bg-black/80 flex items-center justify-center shrink-0">
                      <IconComponent className="h-3.5 w-3.5 text-[#C19A6B]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-tight">
                        {badge.title}
                      </p>
                      <p className="text-[9px] text-neutral-400 leading-tight">{badge.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 hover:text-white hover:bg-black hover:border-white transition-all flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/20 bg-black/80 text-white/80 hover:text-white hover:bg-black hover:border-white transition-all flex items-center justify-center"
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
