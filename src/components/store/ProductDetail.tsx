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

  const handleAddToCart = async () => {
    setAddingCart(true)
    await new Promise((r) => setTimeout(r, 300))
    
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
    setAddingCart(false)
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
    <div className="text-foreground transition-colors duration-300">
      {/* ─── Main Product Section ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <ImageGallery images={images} alt={product.name} />

        <div className="flex flex-col bg-card p-6 md:p-8 rounded-2xl border border-border space-y-6 shadow-sm">
          {/* Brand & Header Info */}
          <div>
            <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1">
              RAXIE LEATHER GOODS
            </span>
            <h1 className="font-serif text-2xl md:text-4xl font-normal text-foreground tracking-wide uppercase leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs">
              <div className="flex items-center gap-1 text-[#C19A6B]">
                <span>★ ★ ★ ★ ★</span>
                <span className="font-bold ml-1 text-foreground">{product.avgRating ? product.avgRating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{product.reviewCount || 128} Ulasan</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{product.totalSold || 0} Terjual</span>

              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-[#C19A6B] transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Bagikan
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-xl bg-muted border border-border flex items-center gap-4">
            <span className="text-2xl md:text-3xl font-bold text-[#C19A6B]">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="bg-red-950/80 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800/50 uppercase">
                  -{discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground py-2 border-y border-border">
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
              <span className="text-xs uppercase font-bold text-muted-foreground">Kuantitas</span>
              <div className="flex items-center border border-border rounded-lg bg-background px-2 py-1">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-foreground">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(selectedVariant.stock, qty + 1))}
                  disabled={qty >= selectedVariant.stock}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                Stok: <span className="font-bold text-foreground">{selectedVariant.stock}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className="flex-1 bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2"
                onClick={handleAddToCart}
                disabled={addingCart || selectedVariant.stock === 0}
              >
                <ShoppingBag className="h-4 w-4" />
                {addingCart ? 'MENAMBAHKAN...' : 'MASUKKAN KERANJANG'}
              </Button>

              <Button
                className="flex-1 border border-border hover:border-foreground text-foreground font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg"
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
                  className={`p-3 rounded-lg border flex items-center justify-center ${isWishlisted ? 'border-red-500 bg-red-950/20 text-red-400' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
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
      <div className="mt-16 bg-card rounded-2xl border border-border p-6 md:p-10 shadow-sm">
        <Tabs defaultValue="deskripsi">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none gap-6">
            {['Deskripsi', 'Spesifikasi', 'Ulasan'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="px-2 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#C19A6B] data-[state=active]:text-[#C19A6B] text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {tab} {tab === 'Ulasan' && `(${product.reviewCount || 0})`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="pt-6 text-xs leading-relaxed text-foreground">
            <TabsContent value="deskripsi" className="space-y-4 max-w-2xl">
              <p>
                {product.description || 'Terbuat dari material PU Leather / Kulit Asli pilihan yang tahan lama, tahan air, dan mudah dibersihkan. Didesain dengan presisi tinggi oleh pengrajin berpengalaman untuk menampung kebutuhan harian Anda dengan rapi.'}
              </p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Material berkualitas tinggi</li>
                <li>Jahitan presisi dan benang tahan lama</li>
                <li>Desain modern & maskulin</li>
                <li>Dilengkapi box kemasan eksklusif RAXIE</li>
              </ul>
            </TabsContent>

            <TabsContent value="spesifikasi" className="space-y-3 max-w-md">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Material</span>
                <span className="font-semibold text-foreground">{product.material || 'PU Leather Premium'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Dimensi</span>
                <span className="font-semibold text-foreground">{product.dimensions || '11 x 9 x 2 cm'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Berat</span>
                <span className="font-semibold text-foreground">{product.weight || 200} gram</span>
              </div>
            </TabsContent>

            <TabsContent value="ulasan" className="space-y-6">
              <form onSubmit={handleSubmitReview} className="space-y-3 max-w-lg bg-background p-4 rounded-xl border border-border">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#C19A6B]">TULIS ULASAN</h4>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-card border border-border text-foreground rounded text-xs px-3 py-1.5 focus:outline-none"
                  >
                    <option value={5}>★★★★★ (5 Bintang)</option>
                    <option value={4}>★★★★ (4 Bintang)</option>
                    <option value={3}>★★★ (3 Bintang)</option>
                  </select>
                </div>
                <div>
                  <textarea
                    rows={3}
                    placeholder="Tulis ulasan Anda mengenai produk ini..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="w-full bg-card border border-border rounded p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#C19A6B]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#C19A6B] text-black font-bold text-xs uppercase tracking-wider px-4 py-2 rounded hover:bg-[#b08b5c]"
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
          <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.2em] uppercase block mb-1 text-center">
            REKOMENDASI
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-normal tracking-wide text-foreground uppercase text-center mb-8">
            PRODUK SERUPA
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp: any) => (
              <div key={rp.id} className="bg-card p-3 rounded-xl border border-border shadow-sm">
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
