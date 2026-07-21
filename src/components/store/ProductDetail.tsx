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
      image: product.images?.[0] || '/placeholder.jpg',
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
          <div className="mb-4">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-3 pb-4 border-b border-border">
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 border-r border-border pr-4">
                  <span className="text-sm font-semibold text-tan-600 underline underline-offset-4 decoration-tan-500/50">
                    {product.avgRating.toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(product.avgRating) ? 'fill-current' : 'opacity-30'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {product.reviewCount > 0 && (
                <div className="text-sm border-r border-border pr-4">
                  <span className="font-semibold text-foreground underline underline-offset-4 decoration-border">{product.reviewCount}</span> <span className="text-muted-foreground">Penilaian</span>
                </div>
              )}
              <div className="text-sm">
                <span className="font-semibold text-foreground">{product.totalSold > 0 ? product.totalSold : 0}</span> <span className="text-muted-foreground">Terjual</span>
              </div>
              
              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-tan-600 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          {/* Price Block (E-commerce Style) */}
          <div className="p-5 rounded-xl bg-secondary/60 dark:bg-secondary/40 border border-border/50 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            {product.compareAtPrice ? (
              <>
                <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="text-3xl md:text-4xl font-bold text-tan-600 dark:text-tan-500">
                  {formatPrice(product.price)}
                </span>
                <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 py-1 uppercase text-[10px] font-bold">
                  {discount}% OFF
                </Badge>
              </>
            ) : (
              <span className="text-3xl md:text-4xl font-bold text-tan-600 dark:text-tan-500">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Shipping & Guarantees */}
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex gap-4">
              <span className="w-24 text-muted-foreground shrink-0 mt-0.5">Pengiriman</span>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-start gap-2">
                  <Truck className="h-5 w-5 text-tan-500 shrink-0" />
                  <div>
                    <span className="font-medium">Gratis Ongkir</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Dapatkan potongan ongkir hingga Rp20.000 untuk minimal belanja Rp300.000</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <span className="w-24 text-muted-foreground shrink-0 mt-0.5">Jaminan Raxie</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                <span className="font-medium text-foreground">100% Kulit Asli & Garansi Retur 7 Hari</span>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="mb-6">
            <VariantSelector
              variants={product.variants.length > 0 ? product.variants : DUMMY_VARIANTS}
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
          <div className="space-y-6 mt-auto border-t border-border pt-6">
            <div className="flex items-center gap-4">
              <span className="w-24 text-sm text-muted-foreground">Kuantitas</span>
              <div className="flex items-center h-10 border border-border rounded-lg bg-background overflow-hidden shrink-0">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(selectedVariant.stock, qty + 1))}
                  disabled={qty >= selectedVariant.stock}
                  className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                Tersisa <span className="font-semibold text-foreground">{selectedVariant.stock}</span> buah
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 text-sm font-medium h-12 rounded-xl border-tan-500 text-tan-600 bg-tan-50 hover:bg-tan-100 dark:bg-tan-950/30 dark:hover:bg-tan-900/50 hover:text-tan-700 transition-all"
                onClick={handleAddToCart}
                disabled={addingCart || selectedVariant.stock === 0}
                loading={addingCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Masukkan Keranjang
              </Button>

              <Button
                variant="brand"
                size="lg"
                className="flex-1 text-sm font-medium h-12 rounded-xl"
                onClick={() => {
                  handleAddToCart();
                  // A real implementation would redirect to checkout
                  // router.push('/checkout');
                }}
                disabled={addingCart || selectedVariant.stock === 0}
              >
                Beli Sekarang
              </Button>

              {/* Wishlist & Compare Toggle */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon-lg"
                  className={`h-12 w-12 border-border rounded-xl ${isWishlisted ? 'text-red-500 hover:text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => toggleWishlist(product)}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon-lg"
                  className={`h-12 w-12 border-border rounded-xl ${isCompared ? 'text-tan-600 hover:text-tan-700 border-tan-200 bg-tan-50 dark:bg-tan-950/20' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={handleCompare}
                  aria-label="Bandingkan"
                >
                  <Scale className="h-5 w-5" />
                </Button>
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
