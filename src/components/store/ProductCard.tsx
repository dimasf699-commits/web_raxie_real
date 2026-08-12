'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Scale, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, getDiscountPercent, getCloudinaryUrl } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCompareStore } from '@/store/compare.store'
import { toast } from '@/components/ui/Toaster'

export interface ProductCardProduct {
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
  weight?: number
}

interface ProductCardProps {
  product: ProductCardProduct
  onQuickView?: (productId: string) => void
  isDarkBg?: boolean
  variant?: 'default' | 'clean'
}

export function ProductCard({ product, onQuickView, isDarkBg = false, variant = 'default' }: ProductCardProps) {
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

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
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
      id: product.productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      avgRating: product.avgRating,
      material: product.material,
      dimensions: product.dimensions,
      weight: typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight
    })
    toast.success('Ditambahkan ke perbandingan')
  }

  if (variant === 'clean') {
    return (
      <div 
        className="group flex flex-col relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-[#F5F5F5] dark:bg-neutral-900 aspect-square relative mb-4 rounded-sm overflow-hidden flex items-center justify-center p-6">
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-[#C19A6B] text-white text-[10px] font-bold px-2 py-1 rounded-sm z-10">
              -{discount}%
            </div>
          )}
          
          <Link href={`/products/${product.slug}`} className="relative w-full h-full mix-blend-multiply dark:mix-blend-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C19A6B]">
            <Image 
              src={getCloudinaryUrl(product.image, { width: 300, quality: 75 })} 
              alt={product.name} 
              fill 
              className="object-contain group-hover:scale-110 transition-transform duration-500" 
            />
          </Link>

          {/* Clean Variant Action Buttons (Wishlist, Compare) */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              className="w-8 h-8 rounded-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Heart className={`h-[14px] w-[14px] transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600 dark:text-neutral-300'}`} />
            </button>
          </div>

          {/* Clean Variant Add to Cart Overlay */}
          <div className="absolute bottom-3 left-3 right-3 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:translate-y-2 lg:group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stock === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.1em] py-2.5 rounded-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {addingCart ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <ShoppingBag className="h-3 w-3" />
              )}
              {product.stock === 0 ? 'Stok Habis' : 'Add to Cart'}
            </button>
          </div>
        </div>
        
        <div>
          <Link href={`/products/${product.slug}`} className="focus-visible:outline-none focus-visible:underline inline-block w-full">
            <h3 className="text-[13px] font-extrabold text-black dark:text-white mb-1 truncate hover:text-[#C19A6B] transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(product.avgRating) ? 'fill-[#C19A6B] text-[#C19A6B]' : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'}`} />
            ))}
            <span className="text-[10px] text-neutral-500 ml-1">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-black dark:text-white">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-neutral-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative block bg-white dark:bg-card border border-[#E5E5E5] dark:border-border rounded-[20px] p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-2xl aspect-product bg-muted">
          <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E6D4A] dark:focus-visible:ring-[#C19A6B]" aria-label={`Lihat detail produk ${product.name}`}>
            <Image
              src={getCloudinaryUrl(product.image, { width: 300, quality: 75 })}
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
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
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              className="w-9 h-9 rounded-full bg-card/90 border border-border flex items-center justify-center shadow-md hover:bg-card transition-colors"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isWishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-foreground/70'
                }`}
              />
            </button>

            {/* Compare */}
            <button
              onClick={handleCompare}
              aria-label="Bandingkan produk"
              className="w-9 h-9 rounded-full bg-card/90 border border-border flex items-center justify-center shadow-md hover:bg-card transition-colors"
            >
              <Scale className={`h-4 w-4 ${isCompared ? 'text-[#8E6D4A] dark:text-[#C19A6B]' : 'text-foreground/70'}`} />
            </button>

            {/* Quick View */}
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickView(product.productId)
                }}
                aria-label="Quick view"
                className="w-9 h-9 rounded-full bg-card/90 border border-border flex items-center justify-center shadow-md hover:bg-card transition-colors"
              >
                <Eye className="h-4 w-4 text-foreground/70" />
              </button>
            )}
          </div>

          {/* Add to Cart overlay on hover */}
          <div className="absolute bottom-3 left-3 right-3 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 lg:translate-y-2 lg:group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={addingCart || product.stock === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#C19A6B] hover:bg-[#b08b5c] text-black text-xs font-bold uppercase tracking-[0.15em] py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {addingCart ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
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
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-4 px-1 text-left space-y-1 relative z-10">
          <Link href={`/product/${product.slug}`} className="focus-visible:outline-none focus-visible:underline inline-block">
            <h3 className="font-bold text-xs uppercase tracking-widest text-foreground group-hover:text-[#8E6D4A] dark:group-hover:text-[#C19A6B] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center justify-start gap-2 pt-0.5">
            <span className="font-bold text-xs text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-[11px] line-through text-muted-foreground">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center justify-start gap-1 text-[#8E6D4A] dark:text-[#C19A6B] pt-0.5">
            <div className="flex text-[#8E6D4A] dark:text-[#C19A6B] text-[10px]" aria-hidden="true">
              ★ ★ ★ ★ ★
            </div>
            <span className="text-[10px] text-muted-foreground tracking-widest">
              ({product.reviewCount || 128})
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
