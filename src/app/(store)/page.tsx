'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Timer,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from '@/components/store/ProductCard'

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

// ─── Hero Data ──────────────────────────────────────────────────────────────────

const heroSlides = [
  {
    id: 1,
    title: 'Keahlian yang\nAbadi',
    subtitle: 'Dompet kulit premium buatan tangan. Dibuat untuk bertahan seumur hidup.',
    cta: 'Jelajahi Koleksi',
    href: '/products',
    badge: 'Koleksi 2024',
    bg: 'from-charcoal-900 via-charcoal-800 to-charcoal-900',
    accentColor: 'text-tan-400',
    image: 'https://i.imgur.com/5oEmCUr.png',
  },
  {
    id: 2,
    title: 'Slim. Elegan.\nTahan Lama.',
    subtitle: 'Koleksi bifold wallet kami menggunakan full-grain leather pilihan dari Italia.',
    cta: 'Lihat Bifold',
    href: '/products?category=bifold',
    badge: 'Best Seller',
    bg: 'from-tan-900 via-tan-800 to-charcoal-900',
    accentColor: 'text-tan-300',
    image: 'https://i.imgur.com/U6nvXHK.jpeg',
  },
  {
    id: 3,
    title: 'Hadiah yang\nTak Terlupakan',
    subtitle: 'Packaging eksklusif siap kirim. Sempurna untuk orang-orang istimewa.',
    cta: 'Pilih Hadiah',
    href: '/products?tag=gift',
    badge: 'Gift Ready',
    bg: 'from-charcoal-900 via-charcoal-900 to-tan-900',
    accentColor: 'text-ivory-300',
    image: 'https://i.imgur.com/QzcD1Ez.jpeg',
  },
]




const testimonials = [
  {
    name: 'Aldi Firmansyah',
    location: 'Jakarta',
    rating: 5,
    text: 'Kualitasnya luar biasa! Sudah 2 tahun dipakai setiap hari dan masih seperti baru. Worth every penny.',
    product: 'Classic Bifold Wallet',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'Sinta Dewi',
    location: 'Surabaya',
    rating: 5,
    text: 'Packaging-nya premium banget, cocok buat hadiah. Suami saya seneng sekali. Pasti beli lagi!',
    product: 'Heritage Trifold',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    name: 'Rizky Pratama',
    location: 'Bandung',
    rating: 5,
    text: 'Slim card holder-nya tipis tapi muat banyak kartu. Kulit-nya makin indah seiring waktu, love it!',
    product: 'Slim Card Holder',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
  },
]

// ─── Components ────────────────────────────────────────────────────────────────

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const diff = endsAt.getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ h: 0, m: 0, s: 0 })
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      {[
        { label: 'JAM', value: timeLeft.h },
        { label: 'MENIT', value: timeLeft.m },
        { label: 'DETIK', value: timeLeft.s },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="bg-charcoal-900 text-ivory-100 font-mono font-bold text-2xl md:text-3xl w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center">
              <span
                suppressHydrationWarning
                className="font-mono font-bold"
              >
                {pad(unit.value)}
              </span>
            </div>
            <span className="text-[9px] font-semibold text-charcoal-500 mt-1 tracking-widest">
              {unit.label}
            </span>
          </div>
          {i < 2 && (
            <span className="text-charcoal-400 font-bold text-xl mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Homepage ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)

  // Real data state
  const [bestSellers, setBestSellers] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [flashSale, setFlashSale] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const t = Date.now()
        const [bestRes, newRes, catRes] = await Promise.all([
          fetch(`/api/products?sort=best-seller&limit=4&t=${t}`),
          fetch(`/api/products?sort=newest&limit=4&t=${t}`),
          fetch(`/api/categories?t=${t}`)
        ])
        const bestData = await bestRes.json()
        const newData = await newRes.json()
        const catData = await catRes.json()
        setBestSellers(bestData.products || [])
        setNewArrivals(newData.products || [])
        setFlashSale(bestData.products?.slice(0, 2) || [])
        if (catData && catData.length > 0) {
          const catImages = [
            'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80',
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
            'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
          ]
          setCategories(catData.map((c: any, i: number) => ({
            name: c.name,
            href: `/products?category=${c.slug}`,
            image: catImages[i % catImages.length],
            count: ''
          })))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const flashSaleEnds = new Date(Date.now() + 8 * 3600000 + 23 * 60000)

  // Auto-play hero carousel
  useEffect(() => {
    if (!isAutoPlay) return
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [isAutoPlay])

  const slide = heroSlides[heroIndex]

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Carousel ──────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} opacity-75`} />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 container-raxie h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={stagger}
              className="max-w-xl"
            >
              <motion.div variants={fadeUp}>
                <Badge variant="new" className="mb-5">
                  <Sparkles className="h-3 w-3" />
                  {slide.badge}
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight whitespace-pre-line"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-ivory-300 text-lg leading-relaxed"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex gap-3">
                <Button asChild size="lg" variant="brand">
                  <Link href={slide.href}>
                    {slide.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 hover:text-white">
                  <Link href="/about">Kisah Kami</Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
          <button
            onClick={() => {
              setIsAutoPlay(false)
              setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setIsAutoPlay(false); setHeroIndex(i) }}
                className={`transition-all duration-300 rounded-full ${i === heroIndex ? 'w-8 bg-tan-400 h-2' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              setIsAutoPlay(false)
              setHeroIndex((i) => (i + 1) % heroSlides.length)
            }}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ─── Trust Badges ───────────────────────────────────────────────────── */}
      <section className="bg-tan-400 py-4">
        <div className="container-raxie">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {[
              { icon: Truck, text: 'Gratis Ongkir min. Rp 500.000' },
              { icon: ShieldCheck, text: 'Garansi Keaslian Produk' },
              { icon: RotateCcw, text: 'Retur 30 Hari' },
              { icon: Star, text: '10.000+ Pelanggan Puas' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white">
                <item.icon className="h-4 w-4 opacity-80" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-raxie">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <Badge variant="new" className="mb-3">Koleksi</Badge>
              <h2 className="font-serif text-4xl font-bold text-foreground">
                Temukan Gaya Anda
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Setiap kategori dibuat dengan standar kualitas tertinggi.
              </p>
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {categories.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl bg-muted/50 animate-pulse" />
                ))
              ) : (
                categories.map((cat) => (
                  <motion.div key={cat.name} variants={fadeUp}>
                    <Link
                      href={cat.href}
                      className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
                    >
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-serif font-semibold text-ivory-100 text-lg">
                          {cat.name}
                        </h3>
                      </div>
                      <div className="absolute inset-0 border-2 border-tan-400/0 group-hover:border-tan-400/50 rounded-2xl transition-colors duration-300" />
                    </Link>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Best Sellers ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-ivory-100 dark:bg-charcoal-900">
        <div className="container-raxie">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <Badge variant="brand" className="mb-3">Terlaris</Badge>
                <h2 className="font-serif text-4xl font-bold text-foreground">
                  Best Seller
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Pilihan terbaik dari pelanggan kami.
                </p>
              </div>
              <Button asChild variant="brand-outline" className="hidden md:flex">
                <Link href="/products?sort=best-seller">
                  Lihat Semua <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted/50 rounded-2xl animate-pulse" />
                ))
              ) : bestSellers.length > 0 ? (
                bestSellers.map((p) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <ProductCard product={p} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Belum ada produk.
                </div>
              )}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Flash Sale ─────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-raxie">
          <AnimatedSection>
            <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-3xl overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  <div>
                    <motion.div variants={fadeUp}>
                      <Badge variant="sale" className="mb-4 animate-pulse">
                        <Timer className="h-3 w-3" />
                        FLASH SALE
                      </Badge>
                    </motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-ivory-100">
                      Hemat hingga 35%
                    </motion.h2>
                    <motion.p variants={fadeUp} className="mt-3 text-charcoal-400">
                      Berakhir dalam:
                    </motion.p>
                    <motion.div variants={fadeUp} className="mt-3">
                      <CountdownTimer endsAt={flashSaleEnds} />
                    </motion.div>
                  </div>

                  <motion.div
                    variants={stagger}
                    className="grid grid-cols-2 gap-4 flex-1 max-w-md"
                  >
                    {isLoading ? null : flashSale.map((p) => (
                      <motion.div key={p.id} variants={fadeUp} className="bg-white/5 dark:bg-black/20 rounded-2xl p-3 border border-white/10">
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── New Arrivals ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-ivory-100 dark:bg-charcoal-900">
        <div className="container-raxie">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
              <div>
                <Badge variant="new" className="mb-3">Baru</Badge>
                <h2 className="font-serif text-4xl font-bold text-foreground">
                  Produk Terbaru
                </h2>
              </div>
              <Button asChild variant="brand-outline" className="hidden md:flex">
                <Link href="/products?sort=newest">
                  Lihat Semua <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-80 bg-muted/50 rounded-2xl animate-pulse" />
                ))
              ) : newArrivals.length > 0 ? (
                newArrivals.map((p) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <ProductCard product={p} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Belum ada produk.
                </div>
              )}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Brand Story ─────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container-raxie">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <motion.div variants={fadeUp} className="relative">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
                  <Image
                    src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80"
                    alt="Pengrajin Raxie"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-tan-400 text-white rounded-2xl p-5 shadow-xl">
                  <div className="text-3xl font-serif font-bold">8+</div>
                  <div className="text-sm font-medium opacity-90">Tahun Keahlian</div>
                </div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection>
              <motion.div variants={fadeUp}>
                <Badge variant="brand" className="mb-4">Tentang Kami</Badge>
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Dibuat dengan Tangan,<br />
                <em className="text-tan-400">Dirancang untuk Selamanya</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-muted-foreground leading-relaxed">
                Raxie lahir dari kecintaan mendalam terhadap kerajinan kulit tradisional.
                Setiap produk kami dijahit dengan tangan oleh pengrajin berpengalaman,
                menggunakan bahan full-grain leather pilihan yang justru semakin indah
                seiring berjalannya waktu.
              </motion.p>
              <motion.p variants={fadeUp} className="mt-3 text-muted-foreground leading-relaxed">
                Kami percaya bahwa aksesori yang baik bukan hanya tentang penampilan —
                melainkan tentang cerita yang terbentuk seiring perjalanan hidupmu.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                <Button asChild size="lg" variant="brand">
                  <Link href="/about">
                    Kisah Lengkap Kami <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-ivory-100 dark:bg-charcoal-900">
        <div className="container-raxie">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <Badge variant="brand" className="mb-3">Ulasan</Badge>
              <h2 className="font-serif text-4xl font-bold text-foreground">
                Kata Pelanggan Kami
              </h2>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-muted-foreground text-sm">4.9/5 dari 10.000+ ulasan</span>
              </div>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-tan-400/30 transition-colors duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.location} · {t.product}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
