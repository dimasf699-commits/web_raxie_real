'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Star, Scale } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCompareStore } from '@/store/compare.store'
import { toast } from '@/components/ui/Toaster'

interface ProductCardProduct {
  id: string
  productId: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  image: string
  avgRating: number
  reviewCount: number
  isBestSeller: boolean
  isNew: boolean
  stock: number
  sku: string
  material?: string
  dimensions?: string
  weight?: string
}

interface ProductCardProps {
  product: ProductCardProduct
  onQuickView?: (productId: string) => void
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.productId))
  const { addItem: addCompare, items: compareItems } = useCompareStore()
  const [addingCart, setAddingCart] = useState(false)

  const isCompared = compareItems.some(item => item.id === product.productId)
  
  const router = useRouter()

  const discount = product.compareAtPrice
    ? getDiscountPercent(product.compareAtPrice, product.price)
    : 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setAddingCart(true)
    await new Promise((r) => setTimeout(r, 300))
    addItem({
      id: product.id,
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      stock: product.stock,
      sku: product.sku,
    })
    toast.success('Ditambahkan ke keranjang!', product.name)
    setAddingCart(false)
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleItem({
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? undefined,
      image: product.image,
    })
    if (!isWishlisted) {
      toast.success('Ditambahkan ke wishlist!', product.name)
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addCompare({
      id: product.id,
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

  return (
    <div
      className="group relative cursor-pointer block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      <div>
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-2xl aspect-product bg-ivory-200 dark:bg-charcoal-800">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <Badge variant="sale">-{discount}%</Badge>
            )}
            {product.isNew && !discount && (
              <Badge variant="new">Baru</Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="brand">Terlaris</Badge>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="warning">Sisa {product.stock}!</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Wishlist */}
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              className="w-9 h-9 rounded-full bg-white/90 dark:bg-charcoal-800/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <motion.div
                animate={isWishlisted ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isWishlisted
                      ? 'fill-red-500 text-red-500'
                      : 'text-foreground/70'
                  }`}
                />
              </motion.div>
            </motion.button>

            {/* Compare */}
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              onClick={handleCompare}
              aria-label="Bandingkan produk"
              className="w-9 h-9 rounded-full bg-white/90 dark:bg-charcoal-800/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <Scale className={`h-4 w-4 ${isCompared ? 'text-tan-500' : 'text-foreground/70'}`} />
            </motion.button>

            {/* Quick View */}
            {onQuickView && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickView(product.productId)
                }}
                aria-label="Quick view"
                className="w-9 h-9 rounded-full bg-white/90 dark:bg-charcoal-800/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Eye className="h-4 w-4 text-foreground/70" />
              </motion.button>
            )}
          </div>

          {/* Add to Cart overlay on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3"
              >
                <button
                  onClick={handleAddToCart}
                  disabled={addingCart || product.stock === 0}
                  className="w-full flex items-center justify-center gap-2 bg-charcoal-900/90 hover:bg-charcoal-900 text-ivory-100 text-sm font-semibold py-2.5 rounded-xl backdrop-blur-sm transition-colors disabled:opacity-50"
                >
                  {addingCart ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-4 h-4 border-2 border-ivory-100/30 border-t-ivory-100 rounded-full"
                    />
                  ) : (
                    <ShoppingBag className="h-4 w-4" />
                  )}
                  {product.stock === 0
                    ? 'Stok Habis'
                    : addingCart
                    ? 'Menambahkan...'
                    : 'Tambah ke Keranjang'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="mt-3 px-1">
          <h3 className="font-medium text-sm text-foreground group-hover:text-tan-500 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-foreground/70">
                {product.avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
