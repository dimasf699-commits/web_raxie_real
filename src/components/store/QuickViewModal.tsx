'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, ExternalLink, Scale } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { toast } from '@/components/ui/Toaster'
import { useCompareStore } from '@/store/compare.store'

interface QuickViewModalProps {
  productId: string | null
  onClose: () => void
}

export function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const [addingCart, setAddingCart] = useState(false)

  const addItem = useCartStore(s => s.addItem)
  const toggleWishlist = useWishlistStore(s => s.toggleItem)
  const isWishlisted = useWishlistStore(s => product ? s.hasItem(product.productId) : false)

  const { addItem: addCompare, items: compareItems } = useCompareStore()
  const isCompared = product ? compareItems.some((i) => i.id === product.productId) : false

  useEffect(() => {
    if (!productId) {
      setProduct(null)
      return
    }
    setLoading(true)
    setSelectedVariantIdx(0)
    setQty(1)
    setImgIdx(0)
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [productId])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent scroll behind modal
  useEffect(() => {
    if (productId) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [productId])

  const selectedVariant = product?.variants?.[selectedVariantIdx]

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return
    setAddingCart(true)
    await new Promise(r => setTimeout(r, 300))
    addItem({
      id: `${product.productId}-${selectedVariant.id}`,
      productId: product.productId,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      slug: product.slug,
      price: selectedVariant.price ?? product.price,
      image: product.images?.[0] ?? product.image,
      quantity: qty,
      stock: selectedVariant.stock,
      sku: `${product.sku}-${selectedVariant.name}`,
    })
    toast.success(`Ditambahkan ke keranjang: ${product.name}`)
    setAddingCart(false)
    onClose()
  }

  const handleCompare = () => {
    if (!product) return
    addCompare({
      id: product.productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      avgRating: product.avgRating,
      material: product.material,
      dimensions: product.dimensions,
      weight: product.weight
    })
    toast.success('Ditambahkan ke perbandingan')
  }

  const discount = product?.compareAtPrice
    ? getDiscountPercent(product.compareAtPrice, product.price)
    : 0

  const images = product?.images?.length ? product.images : [product?.image].filter(Boolean)

  return (
    <AnimatePresence>
      {productId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-border pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <div className="flex justify-end p-4 pb-0">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-10 h-10 border-2 border-tan-200 border-t-tan-500 rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Memuat produk...</span>
                </div>
              ) : product ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-4 md:p-6 pt-2">
                  {/* Image */}
                  <div className="relative">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                      <Image
                        src={images[imgIdx] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {discount > 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="sale">-{discount}%</Badge>
                        </div>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <button
                          onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
                          disabled={imgIdx === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex gap-1.5">
                          {images.map((_: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => setImgIdx(i)}
                              className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-tan-500' : 'bg-border'}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center disabled:opacity-30"
                          disabled={imgIdx === images.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-4 md:pl-6 pt-4 md:pt-0">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        {product.categoryName}
                      </p>
                      <h2 className="font-serif text-2xl font-bold text-foreground leading-tight">
                        {product.name}
                      </h2>

                      {product.reviewCount > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center text-amber-400">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= Math.round(product.avgRating) ? 'fill-current' : 'opacity-30'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {product.avgRating?.toFixed(1)} ({product.reviewCount} ulasan)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-tan-500">
                        {formatPrice(selectedVariant?.price ?? product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {/* Variants */}
                    {product.variants?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">
                          Warna/Ukuran: <span className="font-bold">{selectedVariant?.name}</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((v: any, i: number) => (
                            <button
                              key={v.id}
                              onClick={() => { setSelectedVariantIdx(i); setQty(1) }}
                              disabled={v.stock === 0}
                              className={`px-3 py-1.5 text-sm rounded-lg border transition-all disabled:opacity-40 disabled:line-through ${
                                selectedVariantIdx === i
                                  ? 'border-tan-500 bg-tan-50 text-tan-700 font-semibold'
                                  : 'border-border hover:border-tan-300'
                              }`}
                            >
                              {v.colorHex && (
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-1.5 border border-border align-middle"
                                  style={{ background: v.colorHex }}
                                />
                              )}
                              {v.name}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Stok: {selectedVariant?.stock ?? 0}
                        </p>
                      </div>
                    )}

                    {/* Qty */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-9 h-9 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >-</button>
                        <span className="w-10 text-center font-medium text-sm">{qty}</span>
                        <button
                          onClick={() => setQty(q => Math.min(selectedVariant?.stock ?? 1, q + 1))}
                          disabled={qty >= (selectedVariant?.stock ?? 1)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        >+</button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-auto">
                      <Button
                        className="flex-1"
                        onClick={handleAddToCart}
                        disabled={addingCart || !selectedVariant?.stock}
                        loading={addingCart}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {selectedVariant?.stock === 0 ? 'Stok Habis' : 'Keranjang'}
                      </Button>
                      <button
                        onClick={() => {
                          toggleWishlist({
                            productId: product.productId,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            image: images[0],
                          })
                        }}
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                          isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-border hover:border-tan-300'
                        }`}
                        aria-label="Wishlist"
                      >
                        <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={handleCompare}
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                          isCompared ? 'border-tan-300 bg-tan-50 text-tan-500' : 'border-border hover:border-tan-300'
                        }`}
                        aria-label="Bandingkan"
                      >
                        <Scale className="h-5 w-5" />
                      </button>
                    </div>

                    {/* View Full Page */}
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-tan-600 transition-colors py-2"
                    >
                      Lihat Halaman Lengkap
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  Produk tidak ditemukan
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
