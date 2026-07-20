'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProductCard } from '@/components/store/ProductCard'
import { QuickViewModal } from '@/components/store/QuickViewModal'
import { ProductSort } from '@/components/store/ProductSort'
import { Loader2, PackageSearch } from 'lucide-react'

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{products.length}</span> produk
          {!cursor && ` (semua)`}
        </p>
        <ProductSort />
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center">
          <PackageSearch className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Tidak ada produk ditemukan</h3>
          <p className="text-muted-foreground mt-2 text-sm">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, idx) => (
              <div key={`${product.id}-${idx}`}>
                <ProductCard
                  product={product}
                  onQuickView={(productId) => setQuickViewId(productId)}
                />
              </div>
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {cursor && (
            <div ref={sentinelRef} className="flex justify-center py-10">
              {isLoading && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Memuat lebih banyak produk...</span>
                </div>
              )}
            </div>
          )}

          {!cursor && products.length > 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Semua produk telah ditampilkan</p>
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
