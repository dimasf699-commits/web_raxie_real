import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  PackageCheck,
  Sparkles,
  Award,
  Scissors
} from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
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
    <div className="bg-black text-white min-h-screen overflow-x-hidden font-sans">
      
      {/* ─── 1. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative bg-[#070707] py-16 md:py-24 border-b border-neutral-900 overflow-hidden">
        <div className="container-raxie relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 text-left">
              <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.25em] uppercase block">
                PREMIUM QUALITY
              </span>
              
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.1]">
                ELEVATE YOUR <br />
                <span className="text-[#C19A6B] font-serif">STYLE</span>
              </h1>

              <p className="text-neutral-400 text-sm md:text-base max-w-md leading-relaxed">
                RAXIE hadir dengan koleksi aksesoris kulit premium untuk menegaskan karakter dan gaya hidup modern Anda.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-[0.15em] px-8 py-3.5 rounded transition-all"
                >
                  BELI SEKARANG
                </Link>
                <Link
                  href="/products"
                  className="border border-neutral-700 hover:border-white text-white font-bold text-xs uppercase tracking-[0.15em] px-8 py-3.5 rounded transition-all"
                >
                  LIHAT KOLEKSI
                </Link>
              </div>

              {/* 3 Sub-Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4 text-[#C19A6B]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">PREMIUM MATERIAL</p>
                    <p className="text-[10px] text-neutral-400">Kulit asli berkualitas tinggi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center shrink-0">
                    <Scissors className="h-4 w-4 text-[#C19A6B]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">CRAFTSMANSHIP</p>
                    <p className="text-[10px] text-neutral-400">Detail jahitan sempurna</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-[#C19A6B]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">GARANSI 1 TAHUN</p>
                    <p className="text-[10px] text-neutral-400">Untuk setiap produk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Product Showcase Hero Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-900">
                <Image
                  src="https://i.imgur.com/U6nvXHK.jpeg"
                  alt="RAXIE Premium Leather Box & Wallet"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. CATEGORY CARDS ─────────────────────────────────────────────── */}
      <section className="py-12 bg-white text-black">
        <div className="container-raxie">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative bg-[#F4F1EA] rounded-xl p-6 flex items-center justify-between border border-neutral-200 hover:border-black transition-all shadow-sm hover:shadow-md"
              >
                <div>
                  <h3 className="font-serif font-bold text-xl tracking-wider text-black uppercase">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center text-xs font-semibold text-neutral-600 group-hover:text-black mt-2">
                    Lihat Koleksi <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
                <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="112px"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. BEST SELLERS ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white text-black">
        <div className="container-raxie text-center">
          <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.2em] uppercase block mb-1">
            BEST SELLER
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-wide text-black uppercase mb-12">
            PRODUK TERLARIS
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {bestSellers.length > 0 ? (
              bestSellers.map((p) => (
                <div key={p.id} className="bg-[#121212] p-3 rounded-xl border border-neutral-800">
                  <ProductCard product={p} isDarkBg={true} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-neutral-500">
                Belum ada produk terlaris.
              </div>
            )}
          </div>

          <div className="mt-12">
            <Link
              href="/products"
              className="inline-block border border-black text-black font-bold text-xs uppercase tracking-[0.15em] px-8 py-3 rounded hover:bg-black hover:text-white transition-colors"
            >
              LIHAT SEMUA PRODUK
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4. TRUST BAR (DARK SECTION) ─────────────────────────────────── */}
      <section className="bg-[#0B0A08] py-8 border-y border-neutral-900">
        <div className="container-raxie">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-[#C19A6B]">
                <Truck className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs uppercase tracking-wider text-white">GRATIS ONGKIR</p>
              <p className="text-[11px] text-neutral-400">Seluruh Indonesia</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-[#C19A6B]">
                <Zap className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs uppercase tracking-wider text-white">PENGIRIMAN CEPAT</p>
              <p className="text-[11px] text-neutral-400">1-2 Hari Sampai</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-[#C19A6B]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs uppercase tracking-wider text-white">PEMBAYARAN AMAN</p>
              <p className="text-[11px] text-neutral-400">100% Secure</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-[#C19A6B]">
                <PackageCheck className="h-5 w-5" />
              </div>
              <p className="font-bold text-xs uppercase tracking-wider text-white">PACKAGING PREMIUM</p>
              <p className="text-[11px] text-neutral-400">Box Eksklusif</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. BRAND STORY ("TENTANG RAXIE") ─────────────────────────────── */}
      <section className="bg-white py-16 md:py-24 text-black">
        <div className="container-raxie">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-neutral-200 shadow-xl">
            {/* Left Photo */}
            <div className="relative min-h-[350px] lg:min-h-[450px]">
              <Image
                src="https://i.imgur.com/Fm42C0F.png"
                alt="Tentang RAXIE Leather"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Right Story Text Box */}
            <div className="bg-[#FAF8F5] p-8 md:p-14 flex flex-col justify-center space-y-4">
              <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.2em] uppercase">
                TENTANG RAXIE
              </span>
              
              <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-black leading-tight">
                BUILT FOR STYLE, <br />
                MADE TO LAST
              </h2>

              <p className="text-neutral-600 text-xs md:text-sm leading-relaxed">
                RAXIE percaya bahwa setiap detail mencerminkan kualitas diri. Dibuat dari material terbaik oleh pengrajin berpengalaman untuk menghasilkan produk yang bukan hanya stylish, tapi juga tahan lama.
              </p>

              <div className="pt-4">
                <Link
                  href="/about"
                  className="inline-block bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-[0.15em] px-8 py-3.5 rounded transition-colors"
                >
                  SELENGKAPNYA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
