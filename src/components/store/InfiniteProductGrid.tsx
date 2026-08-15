'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductCard } from '@/components/store/ProductCard'
import { QuickViewModal } from '@/components/store/QuickViewModal'
import { ProductSort } from '@/components/store/ProductSort'
import { FilterSidebar } from '@/components/store/FilterSidebar'
import { Loader2, PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InfiniteProductGridProps {
  searchParams: {
    q?: string
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }
  initialProducts: any[]
  initialCursor: string | null
  totalHint?: number
}

export function InfiniteProductGrid({
  searchParams,
  initialProducts,
  initialCursor,
  totalHint,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [isLoading, setIsLoading] = useState(false)
  const [quickViewId, setQuickViewId] = useState<string | null>(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Re-initialize when searchParams change (filter/sort changes)
  useEffect(() => {
    setProducts(initialProducts)
    setCursor(initialCursor)
  }, [initialProducts, initialCursor])

  const fetchMore = useCallback(async () => {
    if (!cursor || isLoading) return
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      if (searchParams.q) params.set('q', searchParams.q)
      if (searchParams.category) params.set('category', searchParams.category)
      if (searchParams.sort) params.set('sort', searchParams.sort)
      if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice)
      if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice)
      params.set('cursor', cursor)

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()

      if (data.products) {
        setProducts(prev => [...prev, ...data.products])
        setCursor(data.nextCursor)
      }
    } catch (err) {
      console.error('Failed to fetch more products', err)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, isLoading, searchParams])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !cursor) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) fetchMore() },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cursor, fetchMore])

  return (
    <>
      {/* Toolbar (Mobile & Desktop) */}
      <div className="flex items-center justify-between mb-4 lg:mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <p className="text-xs lg:text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-black dark:text-white">{products.length}</span> produk
        </p>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-full text-xs font-bold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </button>

          <ProductSort />
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="bottom-sheet-overlay lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bottom-sheet lg:hidden max-h-[85vh] p-5 flex flex-col"
            >
              <div className="bottom-sheet-handle mb-3" />
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-serif font-extrabold text-sm uppercase tracking-wider">Filter Produk</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pb-4">
                <FilterSidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {products.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center">
          <PackageSearch className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" />
          <h3 className="text-lg font-semibold text-black dark:text-white">Tidak ada produk ditemukan</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => (
              <div key={`${product.id}-${idx}`}>
                <ProductCard
                  product={product}
                  variant="clean"
                  onQuickView={(productId) => setQuickViewId(productId)}
                />
              </div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {cursor && (
            <div ref={sentinelRef} className="flex justify-center py-10">
              {isLoading && (
                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Memuat lebih banyak produk...</span>
                </div>
              )}
            </div>
          )}

          {!cursor && products.length > 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Semua produk telah ditampilkan</p>
            </div>
          )}
        </>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewId}
        onClose={() => setQuickViewId(null)}
      />
    </>
  )
}
