'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ProductSort() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground hidden sm:inline">Urutkan:</span>
      <select
        className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-tan-400 font-medium"
        value={currentSort}
        onChange={handleSortChange}
      >
        <option value="newest">Terbaru</option>
        <option value="best-seller">Terlaris</option>
        <option value="price-asc">Harga: Rendah ke Tinggi</option>
        <option value="price-desc">Harga: Tinggi ke Rendah</option>
        <option value="rating">Rating Tertinggi</option>
      </select>
    </div>
  )
}
