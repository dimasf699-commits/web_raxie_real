'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export interface HeroSlide {
  id: number
  title: string
  subtitle: string
  cta: string
  href: string
  badge: string
  bg: string
  accentColor: string
  image: string
}

interface HeroSliderProps {
  slides: HeroSlide[]
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [heroIndex, setHeroIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlay, slides.length])

  const slide = slides[heroIndex]

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-xl min-h-[420px] md:min-h-[500px] flex items-center"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 items-center p-6 md:p-12 gap-8"
        >
          {/* Text Content */}
          <div className="z-10 space-y-4 max-w-xl">
            <Badge variant="outline" className="text-xs uppercase tracking-widest px-3 py-1 font-semibold">
              {slide.badge}
            </Badge>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="pt-2">
              <Link href={slide.href}>
                <Button size="lg" className="gap-2 font-semibold shadow-md">
                  {slide.cta} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={heroIndex === 0}
              quality={90}
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setHeroIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 px-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === heroIndex ? 'w-6 bg-tan-500' : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => setHeroIndex((prev) => (prev + 1) % slides.length)}
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
