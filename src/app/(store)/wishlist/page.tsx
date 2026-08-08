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
    <div className="bg-black text-white min-h-screen py-10">
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
            <h1 className="font-serif font-bold text-3xl uppercase tracking-wider text-white">
              WISHLIST SAYA{isMounted && items.length > 0 ? ` (${items.length})` : ''}
            </h1>
          </div>

          {!isMounted ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-8 h-8 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-500">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">Wishlist Masih Kosong</h2>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Anda belum menyimpan produk apapun. Klik ikon hati ❤️ di kartu produk untuk menyimpannya di sini.
              </p>
              <Button asChild className="bg-[#C19A6B] text-black font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-[#b08b5c]">
                <Link href="/products">Jelajahi Koleksi</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => {
                const discount = item.compareAtPrice
                  ? getDiscountPercent(item.compareAtPrice, item.price)
                  : 0
                return (
                  <div key={item.productId} className="group relative bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden shadow-md flex flex-col justify-between">
                    {/* Remove btn */}
                    <button
                      onClick={() => {
                        removeItem(item.productId)
                        toast.success('Dihapus dari wishlist', item.name)
                      }}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors border border-neutral-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {discount > 0 && (
                      <div className="absolute top-3 left-3 z-10 bg-red-950/80 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800/50 uppercase">
                        -{discount}% OFF
                      </div>
                    )}

                    <Link href={`/products/${item.slug}`} className="block">
                      <div className="relative aspect-square bg-black overflow-hidden border-b border-neutral-800">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="font-bold text-xs uppercase tracking-wider text-white line-clamp-1 group-hover:text-[#C19A6B] transition-colors">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#C19A6B] text-xs">{formatPrice(item.price)}</span>
                          {item.compareAtPrice && (
                            <span className="text-[11px] text-neutral-500 line-through">{formatPrice(item.compareAtPrice)}</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="px-4 pb-4">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg bg-[#C19A6B] text-black hover:bg-[#b08b5c] transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Keranjang
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
