'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist.store'
import { useCartStore } from '@/store/cart.store'
import { useEffect, useState } from 'react'
import { formatPrice, getDiscountPercent } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/store/ProductCard'

export default function WishlistPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { items, removeItem } = useWishlistStore()
  const addCartItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  function handleAddToCart(item: any) {
    addCartItem({
      id: item.productId,
      productId: item.productId,
      variantId: '',
      name: item.name,
      variantName: '',
      slug: item.slug,
      sku: '',
      price: item.price,
      image: item.image,
      quantity: 1,
      stock: 99,
    })
    toast.success('Berhasil ditambahkan ke keranjang!', item.name)
    openCart()
  }

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen py-10 transition-colors duration-300">
      <div className="container-raxie">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Wishlist', href: '/wishlist' },
          ]}
        />

        <div className="mt-6">
          <div className="mb-8">
            <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1">
              RAXIE FAVORITE ITEMS
            </span>
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl uppercase tracking-tight text-black dark:text-white">
              WISHLIST SAYA{isMounted && items.length > 0 ? ` (${items.length})` : ''}
            </h1>
          </div>

          {!isMounted ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-8 h-8 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white">Wishlist Masih Kosong</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed font-medium">
                Anda belum menyimpan produk apapun. Klik ikon hati ❤️ di kartu produk untuk menyimpannya di sini.
              </p>
              <Button asChild className="bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-sm transition-colors mt-4">
                <Link href="/products">Jelajahi Koleksi</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.productId} className="relative group">
                  <ProductCard
                    variant="clean"
                    product={{
                      ...item,
                      id: item.productId,
                      avgRating: 5,
                      reviewCount: 0,
                      isBestSeller: false,
                      isNew: false,
                      stock: 99,
                      sku: ''
                    }}
                  />
                  {/* Remove override for wishlist page */}
                  <button
                    onClick={() => {
                      removeItem(item.productId)
                      toast.success('Dihapus dari wishlist', item.name)
                    }}
                    className="absolute top-3 left-3 z-20 w-8 h-8 bg-white dark:bg-black rounded-full flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors shadow-sm opacity-0 group-hover:opacity-100 border border-neutral-200 dark:border-neutral-800"
                    title="Hapus dari Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
