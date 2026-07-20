'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Scale } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCompareStore } from '@/store/compare.store'
import { formatPrice } from '@/lib/utils'

export function CompareDrawer() {
  const { isOpen, closeCompare, items, removeItem, clearCompare } = useCompareStore()

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCompare}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
                <h2 className="font-serif font-bold text-lg md:text-xl text-foreground">
                  Bandingkan Produk
                </h2>
                <span className="bg-tan-100 text-tan-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.length}/4
                </span>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCompare} className="text-red-500 hover:text-red-600 hover:bg-red-50 hidden sm:flex">
                    Hapus Semua
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={closeCompare}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <Scale className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
                  <p className="text-muted-foreground">Belum ada produk yang dipilih untuk dibandingkan.</p>
                </div>
              ) : (
                <div className="flex gap-4 min-w-max pb-4">
                  {/* Table Headers */}
                  <div className="w-32 md:w-40 flex-shrink-0 flex flex-col justify-end gap-y-4 pt-[180px] text-sm font-semibold text-muted-foreground">
                    <div className="h-10 border-b border-border flex items-center">Harga</div>
                    <div className="h-10 border-b border-border flex items-center">Rating</div>
                    <div className="h-10 border-b border-border flex items-center">Material</div>
                    <div className="h-10 border-b border-border flex items-center">Dimensi</div>
                    <div className="h-10 border-b border-border flex items-center">Berat</div>
                  </div>

                  {/* Products */}
                  {items.map((item) => (
                    <div key={item.id} className="w-48 md:w-56 flex-shrink-0 flex flex-col">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border mb-3 group">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="250px" />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Link href={`/products/${item.slug}`} onClick={closeCompare} className="font-semibold text-sm line-clamp-2 hover:text-tan-600 mb-2 h-10">
                        {item.name}
                      </Link>

                      <div className="flex flex-col gap-y-4 text-sm">
                        <div className="h-10 border-b border-border flex items-center font-bold text-tan-600">{formatPrice(item.price)}</div>
                        <div className="h-10 border-b border-border flex items-center">
                          {item.avgRating ? `⭐ ${item.avgRating.toFixed(1)}` : '-'}
                        </div>
                        <div className="h-10 border-b border-border flex items-center text-muted-foreground truncate">{item.material || '-'}</div>
                        <div className="h-10 border-b border-border flex items-center text-muted-foreground">{item.dimensions || '-'}</div>
                        <div className="h-10 border-b border-border flex items-center text-muted-foreground">{item.weight ? `${item.weight}g` : '-'}</div>
                      </div>
                      
                      <Button asChild variant="brand" className="mt-4 w-full" onClick={closeCompare}>
                        <Link href={`/products/${item.slug}`}>Lihat Produk</Link>
                      </Button>
                    </div>
                  ))}

                  {/* Empty Slot Placeholder */}
                  {Array.from({ length: 4 - items.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-48 md:w-56 flex-shrink-0 flex flex-col justify-start">
                      <div className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-card mb-3">
                        <span className="text-muted-foreground text-sm">Slot Kosong</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
