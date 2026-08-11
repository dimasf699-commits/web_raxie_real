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
      <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline font-medium">Urutkan:</span>
      <select
        className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#C19A6B] font-medium transition-colors"
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
