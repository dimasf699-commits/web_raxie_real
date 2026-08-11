'use client'

import { useState } from 'react'
import { Heart, Minus, Plus, Share2, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ImageGallery } from '@/components/store/ImageGallery'
import { VariantSelector } from '@/components/store/VariantSelector'
import { ProductCard } from '@/components/store/ProductCard'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCompareStore } from '@/store/compare.store'
import { toast } from '@/components/ui/Toaster'
import { RestockAlertButton } from '@/components/store/RestockAlertButton'

const trackAddToCart = (productName: string, price: number) => {
  if (typeof window !== 'undefined') {
    if ((window as any).fbq) {
      ;(window as any).fbq('track', 'AddToCart', {
        content_name: productName,
        value: price,
        currency: 'IDR'
      })
    }
  }
}

interface ProductDetailProps {
  product: any
  relatedProducts: any[]
}

const DUMMY_VARIANTS: { id: string; name: string; colorHex: string | null; stock: number }[] = [
  { id: 'v1', name: 'Hitam', colorHex: '#1A1611', stock: 10 },
  { id: 'v2', name: 'Tan', colorHex: '#C19A6B', stock: 5 },
  { id: 'v3', name: 'Olive', colorHex: '#556B2F', stock: 0 },
]

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [qty, setQty] = useState(1)
  const actualVariants = product.variants?.length > 0 ? product.variants : DUMMY_VARIANTS
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; name: string; colorHex: string | null; stock: number; price?: number }>(actualVariants[0])
  const [addingCart, setAddingCart] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.id))
  
  const { addItem: addCompare } = useCompareStore()

  const discount = product.compareAtPrice
    ? getDiscountPercent(product.compareAtPrice, product.price)
    : 0

  const handleAddToCart = () => {
    const finalPrice = selectedVariant.price ?? product.price
    
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      slug: product.slug,
      price: finalPrice,
      image: product.images?.[0]?.url || product.image || '/placeholder.jpg',
      quantity: qty,
      stock: selectedVariant.stock,
      sku: `${product.sku || 'SKU'}-${selectedVariant.name.toUpperCase()}`,
    })
    
    trackAddToCart(product.name, finalPrice * qty)
    toast.success('Berhasil ditambahkan ke keranjang!', `${qty}x ${product.name}`)
    openCart()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Lihat ${product.name} di Raxie!`,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.info('Tautan disalin ke clipboard')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.productId || product.id,
          rating,
          comment
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim ulasan')
      toast.success('Ulasan berhasil dikirim!')
      setComment('')
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const images = product.images?.length
    ? product.images.map((i: any) => i.url || i)
    : [
        product.image || '/placeholder.jpg',
      ]

  return (
    <div className="text-black dark:text-white transition-colors duration-300">
      {/* ─── Main Product Section ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <ImageGallery images={images} alt={product.name} />

        <div className="flex flex-col bg-white dark:bg-[#151515] p-6 md:p-8 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
          {/* Brand & Header Info */}
          <div>
            <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1">
              RAXIE LEATHER GOODS
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-black dark:text-white tracking-tight uppercase leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="flex items-center gap-1 text-[#C19A6B]">
                <span>★ ★ ★ ★ ★</span>
                <span className="font-bold ml-1 text-black dark:text-white">{product.avgRating ? product.avgRating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">{product.reviewCount || 128} Ulasan</span>
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
          <div className="p-4 rounded-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
            <span className="text-2xl md:text-3xl font-bold text-[#C19A6B]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-sm text-neutral-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="bg-[#121212] text-white text-[10px] font-bold px-2 py-1 rounded-sm border border-neutral-800 uppercase">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-500 dark:text-neutral-400 py-3 border-y border-neutral-200 dark:border-neutral-800 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#C19A6B] shrink-0" />
              <span>Gratis Ongkir Seluruh Indonesia</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#C19A6B] shrink-0" />
              <span>Garansi 1 Tahun & Retur Mudah</span>
            </div>
          </div>

          {/* Variant Selector */}
          <div>
            <VariantSelector
              variants={actualVariants}
              selectedVariantId={selectedVariant.id}
              onSelect={(variant) => setSelectedVariant({
                id: variant.id,
                name: variant.name,
                colorHex: variant.colorHex ?? null,
                stock: variant.stock,
              })}
            />
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400">Kuantitas</span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-sm bg-white dark:bg-neutral-900 px-2 py-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-black dark:text-white">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(selectedVariant.stock, qty + 1))}
                  disabled={qty >= selectedVariant.stock}
                  className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Stok: <span className="font-bold text-black dark:text-white">{selectedVariant.stock}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className="flex-1 bg-[#C19A6B] hover:bg-[#b08b5c] text-white font-bold text-xs uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                disabled={addingCart || selectedVariant.stock === 0}
              >
                <ShoppingBag className="h-4 w-4" />
                {addingCart ? 'MENAMBAHKAN...' : 'MASUKKAN KERANJANG'}
              </Button>

              <Button
                className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-black dark:text-white font-bold text-xs uppercase tracking-wider py-4 rounded-sm"
                onClick={() => {
                  handleAddToCart()
                }}
                disabled={addingCart || selectedVariant.stock === 0}
              >
                BELI SEKARANG
              </Button>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-sm border flex items-center justify-center transition-colors ${isWishlisted ? 'border-red-500 bg-red-500 text-white' : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'}`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {selectedVariant.stock === 0 && (
              <RestockAlertButton productId={product.id} variantId={selectedVariant.id} />
            )}
          </div>
        </div>
      </div>

      {/* ─── Details & Specs Tabs ─────────────────────────────────────────── */}
      <div className="mt-16 bg-white dark:bg-[#151515] rounded-sm border border-neutral-200 dark:border-neutral-800 p-6 md:p-10 shadow-sm">
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
