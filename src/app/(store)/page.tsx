import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/store/ProductCard'
import { HeroSlider } from '@/components/store/HeroSlider'
import { CountdownTimer } from '@/components/store/CountdownTimer'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // ISR revalidate every 60 seconds for 0ms DB TTFB

// ─── Hero Data ──────────────────────────────────────────────────────────────────

const heroSlides = [
  {
    id: 1,
    title: 'Keahlian yang\nAbadi',
    subtitle: 'Dompet kulit premium buatan tangan. Dibuat untuk bertahan seumur hidup.',
    cta: 'Jelajahi Koleksi',
    href: '/products',
    badge: 'Koleksi 2026',
    bg: 'from-charcoal-900 via-charcoal-800 to-charcoal-900',
    accentColor: 'text-tan-400',
    image: 'https://i.imgur.com/5oEmCUr.png',
  },
  {
    id: 2,
    title: 'Slim. Elegan.\nTahan Lama.',
    subtitle: 'Koleksi bifold wallet kami menggunakan PU Leather premium — tahan lama, tahan air, tampil elegan.',
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

const DEFAULT_HOMEPAGE_CATEGORIES = [
  { name: 'Dompet', href: '/products?category=dompet', image: 'https://i.imgur.com/X1YcH8c.jpeg' },
  { name: 'Tas', href: '/products?category=tas', image: 'https://i.imgur.com/Y6g6vrp.jpeg' },
  { name: 'Sabuk', href: '/products?category=sabuk', image: 'https://i.imgur.com/kF5yKip.jpeg' },
]

async function getHomepageData() {
  try {
    const [bestSellersRaw, newArrivalsRaw, categoriesRaw] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { totalSold: 'desc' },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          compareAtPrice: true,
          avgRating: true,
          reviewCount: true,
          isBestSeller: true,
          isNew: true,
          material: true,
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1, select: { id: true, price: true, stock: true, sku: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          category: { select: { name: true } }
        }
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          compareAtPrice: true,
          avgRating: true,
          reviewCount: true,
          isBestSeller: true,
          isNew: true,
          material: true,
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 1, select: { id: true, price: true, stock: true, sku: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          category: { select: { name: true } }
        }
      }),
      prisma.category.findMany({
        where: { isActive: true, slug: { notIn: ['aksesoris'] } },
        orderBy: { sortOrder: 'asc' },
        select: { name: true, slug: true }
      })
    ])

    const format = (items: any[]) => items.map(p => {
      const v = p.variants[0]
      const img = p.images[0]
      return {
        id: v?.id ?? p.id,
        productId: p.id,
        name: p.name,
        slug: p.slug,
        price: v?.price ?? p.basePrice,
        compareAtPrice: p.compareAtPrice,
        image: img?.url ?? '/placeholder.jpg',
        avgRating: p.avgRating,
        reviewCount: p.reviewCount,
        isBestSeller: p.isBestSeller,
        isNew: p.isNew,
        stock: v?.stock ?? 0,
        sku: v?.sku ?? '',
        categoryName: p.category?.name ?? '',
        material: p.material ?? '',
      }
    })

    const catImageMap: Record<string, string> = {
      dompet: 'https://i.imgur.com/X1YcH8c.jpeg',
      tas: 'https://i.imgur.com/Y6g6vrp.jpeg',
      sabuk: 'https://i.imgur.com/kF5yKip.jpeg',
    }

    const categories = categoriesRaw.length > 0
      ? categoriesRaw.map(c => ({
          name: c.name,
          href: `/products?category=${c.slug}`,
          image: catImageMap[c.slug] || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'
        }))
      : DEFAULT_HOMEPAGE_CATEGORIES

    const bestSellers = format(bestSellersRaw)
    const newArrivals = format(newArrivalsRaw)
    const flashSale = bestSellers.slice(0, 2)

    return { bestSellers, newArrivals, flashSale, categories }
  } catch (e) {
    console.error('[HOMEPAGE_DATA_ERROR]', e)
    return { bestSellers: [], newArrivals: [], flashSale: [], categories: DEFAULT_HOMEPAGE_CATEGORIES }
  }
}

export default async function HomePage() {
  const { bestSellers, newArrivals, flashSale, categories } = await getHomepageData()
  const flashSaleEnds = new Date(Date.now() + 7 * 24 * 3600000) // 7 hari dari sekarang

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Carousel ──────────────────────────────────────────────────── */}
      <section className="py-6 container-raxie">
        <HeroSlider slides={heroSlides} />
      </section>

      {/* ─── Trust Badges ───────────────────────────────────────────────────── */}
      <section className="bg-tan-500 text-white py-4 shadow-sm">
        <div className="container-raxie">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {[
              { icon: Truck, text: 'Resi & Pengiriman Otomatis JNE/J&T' },
              { icon: ShieldCheck, text: 'Garansi Cacat Produk 30 Hari' },
              { icon: RotateCcw, text: 'Retur & Tukar 30 Hari' },
              { icon: Sparkles, text: 'Koleksi PU Leather 2026' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white">
                <item.icon className="h-4 w-4 opacity-90" />
                <span className="text-xs md:text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container-raxie">
          <div className="text-center mb-12">
            <Badge variant="new" className="mb-3">Koleksi</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Temukan Gaya Anda
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm md:text-base">
              Setiap kategori dibuat dengan standar kualitas tertinggi.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] block shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif font-bold text-ivory-100 text-xl">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Best Sellers ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-muted/40 border-y border-border">
        <div className="container-raxie">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="brand" className="mb-3">Terlaris</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Best Seller
              </h2>
              <p className="mt-2 text-muted-foreground text-sm md:text-base">
                Pilihan terbaik dari pelanggan kami.
              </p>
            </div>
            <Button asChild variant="brand-outline" className="hidden md:flex">
              <Link href="/products?sort=best-seller">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.length > 0 ? (
              bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                Belum ada produk.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Flash Sale ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="container-raxie">
          <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-3xl overflow-hidden shadow-2xl border border-charcoal-700">
            <div className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <Badge variant="sale" className="mb-4 animate-pulse">
                    FLASH SALE
                  </Badge>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold text-ivory-100">
                    Hemat hingga 35%
                  </h2>
                  <p className="mt-3 text-charcoal-300 text-sm">
                    Berakhir dalam:
                  </p>
                  <div className="mt-3">
                    <CountdownTimer endsAt={flashSaleEnds} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-lg">
                  {flashSale.map((p) => (
                    <div key={p.id} className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 shadow-xl">
                      <ProductCard product={p} isDarkBg={true} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── New Arrivals ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-muted/40 border-y border-border">
        <div className="container-raxie">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="new" className="mb-3">Baru</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Produk Terbaru
              </h2>
            </div>
            <Button asChild variant="brand-outline" className="hidden md:flex">
              <Link href="/products?sort=newest">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.length > 0 ? (
              newArrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                Belum ada produk.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Brand Story ─────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24">
        <div className="container-raxie">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
                <Image
                  src="https://i.imgur.com/Fm42C0F.png"
                  alt="Pengrajin Leather Raxie"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-tan-500 text-white rounded-2xl p-5 shadow-xl">
                <div className="text-3xl font-serif font-bold">8+</div>
                <div className="text-sm font-medium opacity-90">Tahun Keahlian</div>
              </div>
            </div>

            <div className="space-y-4">
              <Badge variant="brand" className="mb-2">Tentang Kami</Badge>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight">
                Dibuat dengan Tangan,<br />
                <em className="text-tan-500">Dirancang untuk Selamanya</em>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Raxie hadir dengan produk aksesori <strong>PU Leather premium</strong> —
                material modern yang tahan air, mudah dibersihkan, dan tampil elegan
                setiap hari.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Kami percaya bahwa aksesori yang baik bukan hanya tentang penampilan —
                melainkan tentang cerita yang terbentuk seiring perjalanan hidupmu.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" variant="brand">
                  <Link href="/about">
                    Kisah Lengkap Kami <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Customer Testimonials ────────────────────────────────────────── */}
      <section className="py-20 bg-charcoal-900 text-white">
        <div className="container-raxie">
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-3 bg-amber-500/20 text-amber-300 border-amber-500/30">
              Ulasan Pembeli
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Apa Kata Mereka Tentang Raxie?
            </h2>
            <p className="mt-3 text-charcoal-300 max-w-md mx-auto text-sm">
              Kepuasan pelanggan adalah prioritas nomor satu kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ahmad R.',
                city: 'Jakarta Selatan',
                review: 'Dompet bifold Raxie-nya empuk dan jahitan super rapi. Terasa sangat premium padahal harganya terjangkau. Resi JNE langsung terbit otomatis!',
                rating: 5,
                product: 'Dompet Bifold RX008',
              },
              {
                name: 'Budi S.',
                city: 'Bandung',
                review: 'Tas selempang PU Leather-nya tahan air, sangat cocok buat aktivitas harian kuliah & kerja. Pengiriman dari Garut cuma 1 hari sampai.',
                rating: 5,
                product: 'Tas Selempang Leather RX004',
              },
              {
                name: 'Dian P.',
                city: 'Surabaya',
                review: 'Beli sabuk dan dompet untuk kado ulang tahun pasangan. Packaging-nya eksklusif banget dan bahan sintetisnya halus seperti kulit asli.',
                rating: 5,
                product: 'Sabuk & Dompet Gift Set',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-charcoal-800/80 border border-charcoal-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-charcoal-200 text-sm leading-relaxed italic mb-4">
                    "{item.review}"
                  </p>
                </div>
                <div className="border-t border-charcoal-700 pt-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-charcoal-400">{item.city}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-charcoal-900 text-amber-300 px-2 py-1 rounded border border-charcoal-700">
                    {item.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Raxie ─────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/40 border-t border-border">
        <div className="container-raxie">
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-3">Kenapa Raxie?</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Alasan Memilih Kami
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm md:text-base">
              Kami percaya pada kejujuran produk dan kepuasan nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: 'Garansi 30 Hari', desc: 'Jaminan penggantian jika ada cacat produksi dalam 30 hari setelah terima.' },
              { icon: RotateCcw, title: 'Retur Mudah', desc: 'Produk tidak sesuai deskripsi? Kami proses retur tanpa drama.' },
              { icon: Truck, title: 'Kirim ke Seluruh Indonesia', desc: 'Tersedia berbagai pilihan ekspedisi dengan estimasi pengiriman yang akurat.' },
              { icon: Star, title: 'PU Leather Premium', desc: 'Material tahan air, mudah dibersihkan, tampilan rapi dan konsisten di setiap produk.' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card rounded-2xl p-6 border border-border hover:border-tan-400/30 transition-colors duration-300 hover:shadow-md"
              >
                <div className="w-12 h-12 bg-tan-50 dark:bg-tan-950/40 rounded-xl flex items-center justify-center mb-4 border border-tan-200 dark:border-tan-900">
                  <item.icon className="h-6 w-6 text-tan-600 dark:text-tan-400" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
