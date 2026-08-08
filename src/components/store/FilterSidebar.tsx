'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''
  const currentMaterial = searchParams.get('material') || ''

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice)
  const [categories, setCategories] = useState<string[]>(['Dompet', 'Tas', 'Sabuk'])

  useEffect(() => {
    setMinPriceInput(currentMinPrice)
    setMaxPriceInput(currentMaxPrice)
  }, [currentMinPrice, currentMaxPrice])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const cats = await res.json()
        if (cats && cats.length > 0) {
          // Exclude 'aksesoris'
          const filtered = cats
            .filter((c: any) => c.slug !== 'aksesoris' && c.name.toLowerCase() !== 'aksesoris')
            .map((c: any) => c.name)
          if (filtered.length > 0) setCategories(filtered)
        }
      } catch (error) {}
    }
    fetchCategories()
  }, [])

  const handleCategoryChange = (catName: string) => {
    const slug = catName.toLowerCase()
    const params = new URLSearchParams(searchParams.toString())
    if (currentCategory === slug) {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (minPriceInput) {
      params.set('minPrice', minPriceInput)
    } else {
      params.delete('minPrice')
    }
    if (maxPriceInput) {
      params.set('maxPrice', maxPriceInput)
    } else {
      params.delete('maxPrice')
    }
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setMinPriceInput('')
    setMaxPriceInput('')
    router.push('/products')
  }

  return (
    <div className="space-y-6 text-white bg-[#121212] p-5 rounded-2xl border border-neutral-800">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <h3 className="font-serif font-bold text-base tracking-wider uppercase text-[#C19A6B]">FILTER</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-neutral-400 hover:text-[#C19A6B] transition-colors underline"
        >
          Reset Semua
        </button>
      </div>

      <Accordion type="multiple" defaultValue={['kategori', 'harga', 'material']} className="w-full">
        {/* Kategori */}
        <AccordionItem value="kategori" className="border-b border-neutral-800">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-[#C19A6B]">Kategori</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5 pt-1">
              {categories.map((kat) => {
                const isSelected = currentCategory === kat.toLowerCase()
                return (
                  <label key={kat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => handleCategoryChange(kat)}
                    />
                    <div className={`h-4 w-4 rounded border transition-all flex items-center justify-center ${isSelected ? 'bg-[#C19A6B] border-[#C19A6B]' : 'border-neutral-700 bg-black group-hover:border-neutral-500'}`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-black" viewBox="0 0 14 14" fill="none">
                          <path d="M3 8L6 11L11 3.5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${isSelected ? 'text-[#C19A6B] font-bold' : 'text-neutral-300 group-hover:text-white'}`}>
                      {kat}
                    </span>
                  </label>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Price Range Filter */}
        <AccordionItem value="harga" className="border-b border-neutral-800">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-[#C19A6B]">Filter Harga (Rp)</AccordionTrigger>
          <AccordionContent>
            <form onSubmit={handleApplyPriceFilter} className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">MIN PRICE</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-neutral-500">Rp</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C19A6B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">MAX PRICE</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-neutral-500">Rp</span>
                  <input
                    type="number"
                    placeholder="1.000.000"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C19A6B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider py-2 rounded-lg transition-colors mt-2"
              >
                TERAPKAN FILTER
              </button>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* Material */}
        <AccordionItem value="material" className="border-b-0">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-[#C19A6B]">Material</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5 pt-1">
              {['PU Leather Premium'].map((mat) => (
                <div key={mat} className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded border border-[#C19A6B] bg-[#C19A6B] flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-[#C19A6B]">
                    {mat}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
