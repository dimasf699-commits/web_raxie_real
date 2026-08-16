'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Heart,
  ShoppingBag,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scale,
  Star,
  Check
} from 'lucide-react'
import { formatPrice, getDiscountPercent, getCloudinaryUrl } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCompareStore } from '@/store/compare.store'
import { ProductCard } from '@/components/store/ProductCard'
import { ImageGallery } from '@/components/store/ImageGallery'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toaster'
import { trackViewContent, trackAddToCart } from '@/components/analytics/MetaPixel'

interface ProductDetailProps {
  product: any
  relatedProducts: any[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [qty, setQty] = useState(1)
  const actualVariants = product.variants?.length > 0 
    ? product.variants 
    : [{ id: product.id, name: 'Default', colorHex: null, stock: product.stock ?? 10, price: product.price }]
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; name: string; colorHex: string | null; stock: number; price?: number }>(actualVariants[0])
  const [addingCart, setAddingCart] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.productId || product.id))
  
  const { addItem: addCompare } = useCompareStore()

  const discount = product.compareAtPrice
    ? getDiscountPercent(product.compareAtPrice, product.price)
    : 0

  useEffect(() => {
    trackViewContent({
      content_ids: [product.id],
      content_name: product.name,
      value: product.price,
      currency: 'IDR'
    })
  }, [product.id, product.name, product.price])

  const handleAddToCart = () => {
    setAddingCart(true)
    addItem({
      id: selectedVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: selectedVariant.price ?? product.price,
      image: product.images?.[0]?.url || '/placeholder.jpg',
      variantName: selectedVariant.name !== 'Default' ? selectedVariant.name : undefined,
      quantity: qty,
      stock: selectedVariant.stock,
      sku: product.sku || '',
    })
    
    setTimeout(() => {
      setAddingCart(false)
      openCart()
      toast.success('Berhasil', `${product.name} telah ditambahkan ke keranjang belanja.`)
      
      trackAddToCart({
        content_ids: [selectedVariant.id],
        content_name: product.name,
        value: selectedVariant.price ?? product.price,
        currency: 'IDR'
      })
    }, 400)
  }

  const handleWishlist = () => {
    toggleWishlist({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      image: product.images?.[0]?.url || '/placeholder.jpg',
    })
    toast.success(
      isWishlisted ? 'Dihapus dari Wishlist' : 'Ditambahkan ke Wishlist',
      product.name
    )
  }

  const handleCompare = () => {
    addCompare({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0]?.url || '/placeholder.jpg',
      material: product.material ?? undefined,
      dimensions: product.dimensions ?? undefined,
      weight: product.weight ?? undefined,
      avgRating: product.avgRating ?? undefined,
    })
    toast.success('Ditambahkan ke Komparasi', product.name)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim ulasan')
      toast.success('Ulasan berhasil dikirim!')
      setComment('')
    } catch (err: any) {
      toast.error('Gagal', err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Cek produk ${product.name} di RAXIE!`,
          url: window.location.href,
        })
      } catch (err) {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Tautan disalin ke clipboard!')
    }
  }

  const isOutOfStock = selectedVariant.stock <= 0

  return (
    <div className="container-raxie py-6 md:py-12">
      {/* ─── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 font-medium">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors">Produk</Link>
        <span>/</span>
        <span className="text-black dark:text-white font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* ─── Main Product Section (2-Column Layout) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left: Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 sticky top-24">
          <ImageGallery images={product.images || []} alt={product.name} />
        </div>

        {/* Right: Product Buy Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div>
            <span className="text-[#B89A6A] text-[10px] md:text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1.5">
              {product.category?.name || product.categoryName || 'RAXIE LEATHER GOODS'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#0B0B0B] dark:text-white tracking-tight uppercase leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              {product.reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-1 text-[#C19A6B]">
                    <span>
                      {'★'.repeat(Math.min(5, Math.max(1, Math.round(product.avgRating || 5))))}
                      {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, Math.round(product.avgRating || 5)))))}
                    </span>
                    <span className="font-bold ml-1 text-black dark:text-white">{product.avgRating.toFixed(1)}</span>
                  </div>
                  <span className="text-neutral-400">|</span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">{product.reviewCount} Ulasan</span>
                </>
              ) : (
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">Belum ada ulasan</span>
              )}
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">{product.totalSold || 0} Terjual</span>

              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-1 font-bold text-neutral-500 dark:text-neutral-400 hover:text-[#C19A6B] transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Bagikan
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="flex items-center gap-3 md:gap-4 md:p-4 rounded-sm bg-transparent md:bg-neutral-50 dark:md:bg-neutral-900 md:border md:border-neutral-200 dark:md:border-neutral-800">
            <span className="text-xl md:text-3xl font-extrabold text-[#B89A6A]">
              {formatPrice(selectedVariant.price ?? product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > (selectedVariant.price ?? product.price) && (
              <>
                <span className="text-xs md:text-base text-neutral-400 dark:text-neutral-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded-sm">
                  HEMAT {discount}%
                </span>
              </>
            )}
          </div>

          {/* Variant Selector */}
          {actualVariants.length > 1 && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white flex justify-between">
                <span>Varian: <span className="text-[#C19A6B]">{selectedVariant.name}</span></span>
                <span className="text-neutral-400 font-normal">{selectedVariant.stock > 0 ? `Stok: ${selectedVariant.stock}` : 'Habis'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {actualVariants.map((v: any) => {
                  const isSelected = selectedVariant.id === v.id
                  const isVarOutOfStock = v.stock <= 0
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={isVarOutOfStock}
                      className={`px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#C19A6B] bg-[#C19A6B] text-black shadow-sm'
                          : isVarOutOfStock
                          ? 'border-neutral-200 dark:border-neutral-800 text-neutral-400 bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed opacity-50'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 text-black dark:text-white'
                      }`}
                    >
                      {v.name}
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mobile Description Preview */}
          <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
            <p className="line-clamp-3">
              {product.shortDescription || product.description}
            </p>
            <a href="#details" className="text-[#C19A6B] font-bold inline-block mt-1 hover:underline">
              Lihat Spesifikasi Lengkap &rarr;
            </a>
          </div>

          {/* Action Area: Quantity & Add to Cart */}
          <div className="pt-2 space-y-3">
            <div className="flex gap-3">
              {/* Qty Counter */}
              <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-sm bg-neutral-50 dark:bg-neutral-900 px-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1 || isOutOfStock}
                  className="w-8 h-10 flex items-center justify-center font-bold text-sm text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-xs text-black dark:text-white">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(selectedVariant.stock, qty + 1))}
                  disabled={qty >= selectedVariant.stock || isOutOfStock}
                  className="w-8 h-10 flex items-center justify-center font-bold text-sm text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingCart || isOutOfStock}
                className="flex-1 bg-[#121212] dark:bg-white text-white dark:text-black font-bold text-[11px] uppercase tracking-wider py-3.5 px-6 rounded-sm shadow-md hover:bg-black dark:hover:bg-neutral-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingCart ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full"
                  />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                {isOutOfStock ? 'STOK HABIS' : addingCart ? 'MENAMBAHKAN...' : 'TAMBAH KE KERANJANG'}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 flex items-center justify-center rounded-sm border transition-colors ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 dark:bg-red-950/30 text-red-500'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {/* Compare Button */}
              <button
                onClick={handleCompare}
                className="hidden sm:flex w-12 h-12 items-center justify-center rounded-sm border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400 transition-colors"
                aria-label="Bandingkan Produk"
              >
                <Scale className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Value Props / Guarantees */}
          <div className="pt-4 grid grid-cols-3 gap-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C19A6B]" />
              <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-wider">ORIGINAL</span>
              <span className="text-[9px] text-neutral-400">100% PU Premium</span>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C19A6B]" />
              <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-wider">PENGIRIMAN</span>
              <span className="text-[9px] text-neutral-400">Seluruh Indonesia</span>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#C19A6B]" />
              <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-wider">GARANSI</span>
              <span className="text-[9px] text-neutral-400">Retur 7 Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Details & Specs Tabs ─────────────────────────────────────────── */}
      <div id="details" className="mt-8 lg:mt-16 bg-white dark:bg-[#151515] rounded-sm border-y lg:border border-neutral-100 dark:border-neutral-800 p-6 md:p-10 shadow-sm lg:mb-0 mb-32">
        <Tabs defaultValue="deskripsi">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-neutral-200 dark:border-neutral-800 rounded-none gap-6">
            {['Deskripsi', 'Spesifikasi', 'Ulasan'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="px-2 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#C19A6B] data-[state=active]:text-[#C19A6B] text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
              >
                {tab} {tab === 'Ulasan' && `(${product.reviewCount || 0})`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="pt-8 text-xs leading-relaxed text-black dark:text-white">
            <TabsContent value="deskripsi" className="space-y-4 max-w-2xl font-medium">
              <p className="text-neutral-600 dark:text-neutral-400 leading-loose">
                {product.description || 'Terbuat dari material PU Leather Premium pilihan yang tahan lama, tahan air, dan mudah dibersihkan. Didesain dengan presisi tinggi oleh pengrajin berpengalaman untuk menampung kebutuhan harian Anda dengan rapi.'}
              </p>
              <ul className="list-disc pl-4 space-y-2 text-neutral-600 dark:text-neutral-400">
                <li>Material PU Leather Premium sintetis berkualitas tinggi</li>
                <li>Jahitan presisi dan benang tahan lama</li>
                <li>Desain modern & maskulin</li>
                <li>Dilengkapi box kemasan eksklusif RAXIE</li>
              </ul>
            </TabsContent>

            <TabsContent value="spesifikasi" className="space-y-4 max-w-md font-medium">
              <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider">Material</span>
                <span className="font-bold text-black dark:text-white">{product.material || 'PU Leather Premium'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider">Dimensi</span>
                <span className="font-bold text-black dark:text-white">{product.dimensions || '11 x 9 x 2 cm'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider">Berat</span>
                <span className="font-bold text-black dark:text-white">{product.weight || 200} gram</span>
              </div>
            </TabsContent>

            <TabsContent value="ulasan" className="space-y-6">
              {product.reviewCount > 0 ? (
                <div className="space-y-4 max-w-lg mb-8">
                  <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#C19A6B]">ULASAN PEMBELI</h4>
                  <p className="text-xs text-neutral-500">Rating rata-rata: {product.avgRating.toFixed(1)} dari 5.0 ({product.reviewCount} ulasan)</p>
                </div>
              ) : (
                <div className="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-center max-w-lg mb-8">
                  <p className="text-xs text-neutral-500 font-medium">Belum ada ulasan untuk produk ini.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Jadilah pembeli pertama yang memberikan ulasan!</p>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4 max-w-lg bg-neutral-50 dark:bg-neutral-900 p-6 rounded-sm border border-neutral-200 dark:border-neutral-800">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#C19A6B]">TULIS ULASAN</h4>
                <div>
                  <label className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold block mb-2">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 text-black dark:text-white rounded-sm text-xs px-3 py-2.5 focus:outline-none w-full"
                  >
                    <option value={5}>★★★★★ (5 Bintang)</option>
                    <option value={4}>★★★★ (4 Bintang)</option>
                    <option value={3}>★★★ (3 Bintang)</option>
                    <option value={2}>★★ (2 Bintang)</option>
                    <option value={1}>★ (1 Bintang)</option>
                  </select>
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder="Tulis ulasan Anda mengenai produk ini..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-700 rounded-sm p-4 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C19A6B] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#121212] dark:bg-white text-white dark:text-black font-bold text-[11px] uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-black dark:hover:bg-neutral-200 transition-colors w-full"
                >
                  KIRIM ULASAN
                </button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ─── Related Products Section ─────────────────────────────────────── */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1 text-center">
            REKOMENDASI
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white uppercase text-center mb-10">
            PRODUK SERUPA
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp: any) => (
              <div key={rp.id}>
                <ProductCard product={rp} variant="clean" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
