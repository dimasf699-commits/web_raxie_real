import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  PackageCheck,
  Award
} from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import { HeroSlider } from '@/components/store/HeroSlider'
import { prisma } from '@/lib/prisma'

export const revalidate = 60 // ISR revalidate every 60 seconds

const DEFAULT_CATEGORIES = [
  { name: 'DOMPET', href: '/products?category=dompet', image: 'https://i.imgur.com/X1YcH8c.jpeg' },
  { name: 'TAS', href: '/products?category=tas', image: 'https://i.imgur.com/Y6g6vrp.jpeg' },
  { name: 'BELT', href: '/products?category=sabuk', image: 'https://i.imgur.com/kF5yKip.jpeg' },
]

async function getHomepageData() {
  try {
    const [bestSellersRaw, categoriesRaw] = await Promise.all([
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
          name: c.name.toUpperCase(),
          href: `/products?category=${c.slug}`,
          image: catImageMap[c.slug] || 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80'
        }))
      : DEFAULT_CATEGORIES

    const bestSellers = format(bestSellersRaw)

    return { bestSellers, categories }
  } catch (e) {
    console.error('[HOMEPAGE_DATA_ERROR]', e)
    return { bestSellers: [], categories: DEFAULT_CATEGORIES }
  }
}

export default async function HomePage() {
  const { bestSellers, categories } = await getHomepageData()

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* ─── 1. HERO SLIDER CAROUSEL (FULL WIDTH BACKGROUND) ──────────────── */}
      <HeroSlider />

      {/* ─── 2. CATEGORY CARDS ─────────────────────────────────────────────── */}
      <section className="py-12 bg-background text-foreground transition-colors duration-300">
        <div className="container-raxie">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative bg-card rounded-xl p-6 flex items-center justify-between border border-border hover:border-[#C19A6B] transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <h3 className="font-serif font-bold text-lg tracking-wider text-foreground group-hover:text-[#C19A6B] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-1 block">
                    Lihat Produk &rarr;
                  </span>
                </div>
                <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 border border-border">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. BEST SELLERS ──────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/40 border-y border-border transition-colors duration-300">
        <div className="container-raxie">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.2em] uppercase block mb-1">
                PILIHAN TERFAVORIT
              </span>
              <h2 className="font-serif text-2xl md:text-4xl font-normal text-foreground uppercase tracking-wide">
                PRODUK TERLARIS
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold tracking-wider text-[#C19A6B] hover:underline flex items-center gap-1 uppercase"
            >
              LIHAT SEMUA PRODUK <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. TRUST BAR (4 FEATURES) ────────────────────────────────────── */}
      <section className="py-12 bg-background text-foreground transition-colors duration-300 border-b border-border">
        <div className="container-raxie">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-2">
              <Truck className="h-6 w-6 text-[#C19A6B] mx-auto" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">GRATIS ONGKIR</h4>
              <p className="text-[11px] text-muted-foreground">Seluruh Indonesia tanpa min. belanja</p>
            </div>
            <div className="p-4 space-y-2">
              <ShieldCheck className="h-6 w-6 text-[#C19A6B] mx-auto" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">GARANSI 1 TAHUN</h4>
              <p className="text-[11px] text-muted-foreground">Jaminan kualitas & material</p>
            </div>
            <div className="p-4 space-y-2">
              <PackageCheck className="h-6 w-6 text-[#C19A6B] mx-auto" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">PEMBAYARAN AMAN</h4>
              <p className="text-[11px] text-muted-foreground">BCA, Mandiri, QRIS & Midtrans</p>
            </div>
            <div className="p-4 space-y-2">
              <Zap className="h-6 w-6 text-[#C19A6B] mx-auto" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">PROSES FAST RESPONSE</h4>
              <p className="text-[11px] text-muted-foreground">Dikirim pada hari yang sama</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BRAND STORY & CRAFTSMANSHIP ───────────────────────────────── */}
      <section className="py-20 bg-background text-foreground transition-colors duration-300">
        <div className="container-raxie">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-xl">
              <Image
                src="https://i.imgur.com/1QtzAZ5.png"
                alt="Pengrajin RAXIE"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                <div>
                  <span className="text-[#C19A6B] text-xs font-bold tracking-widest uppercase">RAXIE CRAFTSMANSHIP</span>
                  <h3 className="font-serif text-2xl text-white font-normal uppercase mt-1">Dedikasi Pada Kualitas</h3>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.2em] uppercase block">
                TENTANG BRAND RAXIE
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground uppercase tracking-wide leading-tight">
                MENCIPTAKAN AKSESORIS KULIT DENGAN PRESISI SANGAT TINGGI
              </h2>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                Setiap dompet dan aksesoris RAXIE dirancang khusus menggunakan material PU Leather Premium pilihan. Kami menggabungkan estetika maskulin modern dengan ketahanan jangka panjang, memberikan rasa percaya diri di setiap langkah Anda.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-[#C19A6B] text-[#C19A6B] hover:bg-[#C19A6B] hover:text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition-all"
                >
                  BACA SELENGKAPNYA <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
