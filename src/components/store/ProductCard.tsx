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
import { trackAddToCart } from '@/components/analytics/MetaPixel'

import { useQuickViewStore } from '@/store/quickview.store'

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
  variantId?: string
  variantName?: string
}

interface ProductCardProps {
  product: ProductCardProduct
  onQuickView?: (productId: string) => void
  isDarkBg?: boolean
  variant?: 'default' | 'clean'
}

export function ProductCard({ product, onQuickView, isDarkBg = false, variant = 'default' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const isWishlisted = useWishlistStore((s) => s.hasItem(product.productId))
  const { addItem: addCompare, items: compareItems } = useCompareStore()
  const openQuickView = useQuickViewStore((s) => s.openQuickView)

  const isCompared = compareItems.some(item => item.id === product.productId)
  
  const router = useRouter()

  const discount = product.compareAtPrice
    ? getDiscountPercent(product.compareAtPrice, product.price)
    : 0

  function handleCardAction(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product.productId)
    } else {
      openQuickView(product.productId)
    }
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
        className="group flex flex-col relative bg-transparent h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-[#F8F6F2] dark:bg-neutral-900 aspect-product relative mb-2.5 rounded-[12px] sm:rounded-[16px] overflow-hidden flex items-center justify-center p-3 border border-neutral-100 dark:border-neutral-800 shadow-sm">
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-[#B89A6A] text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
              -{discount}%
            </div>
          )}
          
          <Link href={`/products/${product.slug}`} className="relative w-full h-full mix-blend-multiply dark:mix-blend-normal focus-visible:outline-none">
            <Image 
              src={getCloudinaryUrl(product.image, { width: 300, quality: 75 })} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-[12px] sm:rounded-[16px]" 
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          </Link>

          {/* Action Buttons (Wishlist) always visible on top right */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600 dark:text-neutral-300'}`} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between px-0.5 space-y-1">
          <div>
            <Link href={`/products/${product.slug}`} className="focus-visible:outline-none inline-block w-full">
              <h3 className="text-[11px] sm:text-[13px] font-bold text-[#0B0B0B] dark:text-white mb-1 truncate hover:text-[#B89A6A] transition-colors">{product.name}</h3>
            </Link>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[12px] sm:text-[14px] font-extrabold text-[#0B0B0B] dark:text-white">{formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[9px] sm:text-[11px] text-neutral-400 line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <div className="pt-1.5">
            <button
              onClick={handleCardAction}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-1.5 bg-[#C19A6B] hover:bg-[#b08b5c] text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider py-1.5 sm:py-2 rounded-md shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {product.stock === 0 ? 'Stok Habis' : 'Pilih Varian'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative block bg-white dark:bg-[#1A1A1A] border border-[#E5D5C5]/70 dark:border-[#C19A6B]/30 rounded-[14px] sm:rounded-[16px] p-2.5 sm:p-3 shadow-sm hover:shadow-md transition-all duration-300 h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Image Container with uniform rounded corners */}
        <div className="relative overflow-hidden rounded-[10px] sm:rounded-[14px] aspect-product bg-[#F9F7F5] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E6D4A] dark:focus-visible:ring-[#C19A6B]" aria-label={`Lihat detail produk ${product.name}`}>
            <Image
              src={getCloudinaryUrl(product.image, { width: 300, quality: 75 })}
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 rounded-[10px] sm:rounded-[14px]"
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

          {/* Action Buttons (Wishlist visible always, Compare/QuickView desktop only) */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 z-10">
            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-black/70 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <Heart
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                  isWishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              />
            </button>

            {/* Compare (Desktop only) */}
            <button
              onClick={handleCompare}
              aria-label="Bandingkan produk"
              className="hidden lg:flex w-9 h-9 rounded-full bg-card/90 border border-border items-center justify-center shadow-md hover:bg-card transition-colors opacity-0 group-hover:opacity-100"
            >
              <Scale className={`h-4 w-4 ${isCompared ? 'text-[#8E6D4A] dark:text-[#C19A6B]' : 'text-foreground/70'}`} />
            </button>

            {/* Quick View (Desktop only) */}
            <button
              onClick={handleCardAction}
              aria-label="Quick view"
              className="hidden lg:flex w-9 h-9 rounded-full bg-card/90 border border-border items-center justify-center shadow-md hover:bg-card transition-colors opacity-0 group-hover:opacity-100"
            >
              <Eye className="h-4 w-4 text-foreground/70" />
            </button>
          </div>

          {/* Add to Cart overlay (Desktop only on hover) */}
          <div className="hidden lg:block absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleCardAction}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#C19A6B] hover:bg-[#b08b5c] text-black text-xs font-bold uppercase tracking-[0.15em] py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {product.stock === 0 ? 'Stok Habis' : 'Pilih Varian'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-2.5 sm:mt-4 px-0.5 text-left space-y-1.5 relative z-10 flex-1 flex flex-col justify-between">
          <div>
            <Link href={`/products/${product.slug}`} className="focus-visible:outline-none focus-visible:underline inline-block w-full">
              <h3 className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-foreground group-hover:text-[#8E6D4A] dark:group-hover:text-[#C19A6B] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex items-center justify-start gap-1.5 pt-0.5 flex-wrap">
              <span className="font-bold text-[11px] sm:text-xs text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[9px] sm:text-[11px] line-through text-muted-foreground">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.reviewCount > 0 ? (
              <div className="flex items-center justify-start gap-1 text-[#8E6D4A] dark:text-[#C19A6B] pt-0.5">
                <div className="flex text-[#8E6D4A] dark:text-[#C19A6B] text-[9px] sm:text-[10px]" aria-hidden="true">
                  {'★'.repeat(Math.min(5, Math.max(1, Math.round(product.avgRating || 5))))}
                  {'☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(1, Math.round(product.avgRating || 5)))))}
                </div>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground tracking-tight font-medium">
                  {product.avgRating ? product.avgRating.toFixed(1) : ''} ({product.reviewCount})
                </span>
              </div>
            ) : (
              <div className="pt-0.5">
                <span className="text-[9px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">
                  Belum ada ulasan
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart button */}
          <div className="pt-2">
            <button
              onClick={handleCardAction}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-1.5 bg-[#C19A6B] hover:bg-[#b08b5c] text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider py-2 rounded-md shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {product.stock === 0 ? 'Stok Habis' : 'Pilih Varian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
