'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Minus, Plus, Scale, Share2, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ImageGallery } from '@/components/store/ImageGallery'
import { VariantSelector } from '@/components/store/VariantSelector'
import { ProductCard } from '@/components/store/ProductCard'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCompareStore } from '@/store/compare.store'
import { toast } from '@/components/ui/Toaster'

interface ProductDetailProps {
  product: any
  relatedProducts: any[]
}

// Dummy variants for showcase
const DUMMY_VARIANTS: { id: string; name: string; colorHex: string | null; stock: number }[] = [
  { id: 'v1', name: 'Hitam', colorHex: '#1A1611', stock: 10 },
  { id: 'v2', name: 'Tan', colorHex: '#C19A6B', stock: 5 },
  { id: 'v3', name: 'Olive', colorHex: '#556B2F', stock: 0 },
]

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; name: string; colorHex: string | null; stock: number }>(DUMMY_VARIANTS[0])
  const [addingCart, setAddingCart] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.productId))
  
  const { addItem: addCompare, items: compareItems } = useCompareStore()
  const isCompared = compareItems.some((i) => i.id === product.productId)

  const discount = product.compareAtPrice
    ? getDiscountPercent(product.compareAtPrice, product.price)
    : 0

  const handleAddToCart = async () => {
    setAddingCart(true)
    await new Promise((r) => setTimeout(r, 400))
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.productId,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      slug: product.slug,
      price: product.price,
      image: product.image, // Ideally variant image
      quantity: qty,
      stock: selectedVariant.stock,
      sku: `${product.sku}-${selectedVariant.name.toUpperCase()}`,
    })
    toast.success('Berhasil ditambahkan ke keranjang!', `${qty}x ${product.name}`)
    setAddingCart(false)
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

  const handleCompare = () => {
    addCompare({
      id: product.productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      avgRating: product.avgRating,
    })
    toast.success('Ditambahkan ke perbandingan')
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
      // Ideally trigger a router.refresh() here to show the new review
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const images = product.images?.length
    ? product.images
    : [
        product.image,
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
        'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=800&q=80',
      ]

  return (
    <div>
      {/* ─── Main Product Section ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <ImageGallery images={images} alt={product.name} />

        <div className="flex flex-col">
          {/* Header Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {product.reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= Math.round(product.avgRating) ? 'fill-current' : 'opacity-30'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium ml-1">
                        {product.avgRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground underline-link cursor-pointer ml-1">
                        ({product.reviewCount} Ulasan)
                      </span>
                    </div>
                  )}
                  {product.totalSold > 50 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-sm text-muted-foreground">{product.totalSold}+ Terjual</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-3xl font-bold text-tan-500">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through mb-1">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <Badge variant="sale" className="mb-2">Hemat {discount}%</Badge>
                </>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-border my-6" />

          {/* Variants */}
          <div className="mb-6">
            <VariantSelector
              variants={DUMMY_VARIANTS}
              selectedVariantId={selectedVariant.id}
              onSelect={(variant) => setSelectedVariant({
                  id: variant.id,
                  name: variant.name,
                  colorHex: variant.colorHex ?? null,
                  stock: variant.stock,
                })}
            />
          </div>

          {/* Actions */}
          <div className="space-y-4 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kuantitas</span>
              <span className="text-sm text-muted-foreground">
                Sisa stok: <span className="font-semibold text-foreground">{selectedVariant.stock}</span>
              </span>
            </div>
            <div className="flex gap-4">
              {/* Qty Selector */}
              <div className="flex items-center h-12 border border-border rounded-xl bg-background overflow-hidden shrink-0">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(selectedVariant.stock, qty + 1))}
                  disabled={qty >= selectedVariant.stock}
                  className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                variant="brand"
                size="lg"
                className="flex-1 text-base h-12 rounded-xl"
                onClick={handleAddToCart}
                disabled={addingCart || selectedVariant.stock === 0}
                loading={addingCart}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Tambah ke Keranjang
              </Button>

              {/* Wishlist */}
              <Button
                variant="outline"
                size="icon-lg"
                className={`shrink-0 border-border rounded-xl ${isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              
              {/* Compare */}
              <Button
                variant="outline"
                size="icon-lg"
                className={`shrink-0 border-border rounded-xl ${isCompared ? 'text-tan-500 hover:text-tan-600' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={handleCompare}
                aria-label="Bandingkan"
              >
                <Scale className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
              <Truck className="h-5 w-5 text-tan-500" />
              <div>
                <div className="text-sm font-semibold">Gratis Ongkir</div>
                <div className="text-xs text-muted-foreground">Minimal belanja Rp500k</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary">
              <ShieldCheck className="h-5 w-5 text-tan-500" />
              <div>
                <div className="text-sm font-semibold">Garansi Asli</div>
                <div className="text-xs text-muted-foreground">100% Kulit Asli</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs Section ────────────────────────────────────────────────────── */}
      <div className="mt-20">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none">
            {['Deskripsi', 'Spesifikasi', 'Ulasan'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="px-6 py-3 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-tan-400 text-base"
              >
                {tab} {tab === 'Ulasan' && `(${product.reviewCount})`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="pt-8">
            <TabsContent value="deskripsi" className="prose prose-stone dark:prose-invert max-w-3xl">
              <p>
                Dirancang untuk pria modern yang menghargai minimalisme tanpa mengorbankan fungsionalitas. 
                Terbuat dari full-grain cowhide leather berkualitas tinggi yang akan membentuk patina unik 
                seiring waktu, menjadikannya semakin personal dan berkarakter.
              </p>
              <ul>
                <li>Kapasitas: 6-8 kartu</li>
                <li>Kompartemen uang tunai tersembunyi</li>
                <li>Jahitan tangan yang presisi dengan benang nylon tahan lama</li>
                <li>Tepi yang dipoles halus</li>
              </ul>
              <p>
                Setiap produk dilengkapi dengan garansi 1 tahun untuk cacat produksi dan hardware.
              </p>
            </TabsContent>
            
            <TabsContent value="spesifikasi" className="max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex flex-col py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Material</span>
                  <span className="font-medium mt-1">Full Grain Cowhide Leather</span>
                </div>
                <div className="flex flex-col py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Dimensi</span>
                  <span className="font-medium mt-1">11cm x 9cm x 1.5cm</span>
                </div>
                <div className="flex flex-col py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Berat</span>
                  <span className="font-medium mt-1">65 gram</span>
                </div>
                <div className="flex flex-col py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Asal Pembuatan</span>
                  <span className="font-medium mt-1">Bandung, Indonesia</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ulasan">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                <div className="md:col-span-1 border border-border rounded-xl p-6 h-fit bg-secondary/50">
                  <h3 className="font-bold text-lg mb-2">Tulis Ulasan</h3>
                  <p className="text-sm text-muted-foreground mb-4">Bagikan pengalaman Anda menggunakan produk ini kepada pelanggan lain.</p>
                  
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star className={`h-6 w-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground opacity-30 hover:opacity-100'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Komentar</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        minLength={3}
                        rows={4}
                        placeholder="Kualitas jahitan sangat rapi..."
                        className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-tan-500/50"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting} loading={isSubmitting}>
                      Kirim Ulasan
                    </Button>
                  </form>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {(!product.reviews || product.reviews.length === 0) ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground">Belum ada ulasan untuk produk ini.</p>
                      <p className="text-sm text-muted-foreground mt-1">Jadilah yang pertama memberikan ulasan!</p>
                    </div>
                  ) : (
                    product.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-tan-100 flex items-center justify-center text-tan-700 font-bold text-xs uppercase">
                              {review.userName?.[0] || 'A'}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{review.userName || 'Anonim'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(review.createdAt))}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-current' : 'opacity-30'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed mt-2">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ─── Related Products ───────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-10 border-t border-border">
          <h2 className="font-serif text-3xl font-bold mb-8">Anda Mungkin Suka</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
