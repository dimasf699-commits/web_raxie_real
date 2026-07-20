'use client'
import React from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import { cn } from '@/lib/utils'

const filters = {
  kategori: ['Dompet', 'Aksesoris', 'Bifold Wallet', 'Slim Wallet', 'Card Holder', 'Long Wallet'],
  material: ['Full Grain Leather', 'Top Grain Leather', 'Suede', 'Vegan Leather'],
  warna: ['Hitam', 'Coklat Tua', 'Tan', 'Navy', 'Olive'],
  harga: [
    { label: 'Di bawah Rp 300.000', value: '0-300000' },
    { label: 'Rp 300.000 - Rp 600.000', value: '300000-600000' },
    { label: 'Di atas Rp 600.000', value: '600000-9999999' },
  ],
}

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = React.useState<string[]>([])

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const cats = await res.json()
        if (cats && cats.length > 0) {
          setCategories(cats.map((c: any) => c.name))
        } else {
          setCategories(filters.kategori)
        }
      } catch (error) {
        setCategories(filters.kategori)
      }
    }
    fetchCategories()
  }, [])

  // Internal state for instantaneous UI updates (could also just read from searchParams)
  const currentCategory = searchParams.get('category') || ''

  const handleCategoryChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val === currentCategory) {
      params.delete('category')
    } else {
      params.set('category', val.toLowerCase())
    }
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  return (
    <div className="space-y-4 pr-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Filter</h3>
        <button
          onClick={clearFilters}
          className="text-xs text-muted-foreground hover:text-tan-500 underline-link"
        >
          Reset Semua
        </button>
      </div>

      <Accordion type="multiple" defaultValue={['kategori', 'material', 'harga']} className="w-full">
        <AccordionItem value="kategori">
          <AccordionTrigger>Kategori</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5">
              {categories.map((kat) => (
                <label key={kat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={currentCategory === kat.toLowerCase()}
                      onChange={() => handleCategoryChange(kat)}
                    />
                    <div className="h-4 w-4 rounded-sm border border-border bg-transparent peer-checked:bg-tan-400 peer-checked:border-tan-400 transition-all"></div>
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                    </svg>
                  </div>
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {kat}
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="material">
          <AccordionTrigger>Material</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5">
              {filters.material.map((mat) => (
                <label key={mat} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="h-4 w-4 rounded-sm border border-border bg-transparent peer-checked:bg-tan-400 peer-checked:border-tan-400 transition-all"></div>
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                    </svg>
                  </div>
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {mat}
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="harga">
          <AccordionTrigger>Harga</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5">
              {filters.harga.map((price) => (
                <label key={price.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="radio" name="harga" className="peer sr-only" />
                    <div className="h-4 w-4 rounded-full border border-border bg-transparent peer-checked:border-tan-400 transition-all"></div>
                    <div className="absolute h-2 w-2 rounded-full bg-tan-400 opacity-0 peer-checked:opacity-100 pointer-events-none transition-all"></div>
                  </div>
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {price.label}
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="warna">
          <AccordionTrigger>Warna</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {filters.warna.map((color) => {
                const colorMap: Record<string, string> = {
                  Hitam: 'bg-black',
                  'Coklat Tua': 'bg-[#4A3728]',
                  Tan: 'bg-[#C19A6B]',
                  Navy: 'bg-blue-900',
                  Olive: 'bg-[#556B2F]',
                }
                return (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border border-border shadow-sm flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-tan-400 focus:ring-offset-2"
                    title={color}
                  >
                    <span className={cn('w-6 h-6 rounded-full', colorMap[color])} />
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
