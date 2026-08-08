'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Award, ShieldCheck, PackageCheck, Zap, Sparkles, Box } from 'lucide-react'

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
    subtitle: 'DOMPET PREMIUM, ELEGAN & BERKELAS',
    title: 'KULIT SINTETIS PREMIUM',
    description: 'Tekstur mewah, kuat, tahan lama, dan nyaman digunakan setiap hari.',
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
    bgImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1920&auto=format&fit=crop',
    subtitle: 'PREMIUM LEATHER GOODS',
    title: 'ELEVATE YOUR STYLE',
    description: 'RAXIE hadir dengan koleksi aksesoris kulit premium untuk menegaskan karakter dan gaya hidup modern Anda.',
    buttonText: 'JELAJAHI KOLEKSI',
    buttonLink: '/products',
    badges: [
      { icon: Award, title: 'PREMIUM MATERIAL', desc: 'PU Leather Berkualitas' },
      { icon: Sparkles, title: 'CRAFTSMANSHIP', desc: 'Detail Jahitan Sempurna' },
      { icon: ShieldCheck, title: 'GARANSI 1 TAHUN', desc: 'Untuk Setiap Produk' },
    ],
  },
  {
    id: 3,
    bgImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1920&auto=format&fit=crop',
    subtitle: 'MODERN MASCULINE ELEGANCE',
    title: 'KOLEKSI EKSKLUSIF RAXIE',
    description: 'Perpaduan sempurna antara kerapian jahitan, material presisi, dan kenyamanan pemakaian sepanjang hari.',
    buttonText: 'BELI SEKARANG',
    buttonLink: '/products',
    badges: [
      { icon: Award, title: 'KUALITAS TERBAIK', desc: 'Standar Ekspor' },
      { icon: ShieldCheck, title: 'GRATIS ONGKIR', desc: 'Seluruh Indonesia' },
      { icon: Zap, title: 'PENGIRIMAN CEPAT', desc: 'Proses Harian' },
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
    <section className="relative w-full min-h-[550px] md:min-h-[620px] bg-black text-white overflow-hidden border-b border-neutral-900 flex items-center">
      {/* Background Image Carousel with Fade & Scale Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={activeSlide.bgImage}
            alt={activeSlide.title}
            fill
            priority
            className="object-cover object-center md:object-right"
          />
          {/* Gradient Overlays for High Contrast Text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="container-raxie relative z-10 py-16 md:py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl space-y-6"
          >
            {/* Tag / Subtitle */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#C19A6B]/50 bg-black/60 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C19A6B] animate-pulse" />
              <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase">
                {activeSlide.subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.1] uppercase">
              {activeSlide.title}
            </h1>

            {/* Description */}
            <p className="text-neutral-300 text-sm md:text-base max-w-lg leading-relaxed font-light">
              {activeSlide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={activeSlide.buttonLink}
                className="bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-[0.15em] px-8 py-3.5 rounded shadow-lg shadow-[#C19A6B]/20 transition-all hover:scale-105"
              >
                {activeSlide.buttonText}
              </Link>
              <Link
                href="/products"
                className="border border-neutral-600 hover:border-white text-white font-bold text-xs uppercase tracking-[0.15em] px-8 py-3.5 rounded bg-black/40 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                LIHAT KOLEKSI
              </Link>
            </div>

            {/* Sub-Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-neutral-800/80">
              {activeSlide.badges.map((badge, idx) => {
                const IconComponent = badge.icon
                return (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full border border-neutral-700 bg-black/40 flex items-center justify-center shrink-0">
                      <IconComponent className="h-4 w-4 text-[#C19A6B]" />
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/20 bg-black/40 text-white/80 hover:text-white hover:bg-black/80 hover:border-white transition-all flex items-center justify-center backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/20 bg-black/40 text-white/80 hover:text-white hover:bg-black/80 hover:border-white transition-all flex items-center justify-center backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
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
