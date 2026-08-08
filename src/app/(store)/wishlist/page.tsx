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
    <div className="bg-background text-foreground min-h-screen py-10 transition-colors duration-300">
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
            <h1 className="font-serif font-bold text-3xl uppercase tracking-wider text-foreground">
              WISHLIST SAYA{isMounted && items.length > 0 ? ` (${items.length})` : ''}
            </h1>
          </div>

          {!isMounted ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-8 h-8 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-muted border border-border rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">Wishlist Masih Kosong</h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
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
                  <div key={item.productId} className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between p-3">
                    {/* Remove btn */}
                    <button
                      onClick={() => {
                        removeItem(item.productId)
                        toast.success('Dihapus dari wishlist', item.name)
                      }}
                      className="absolute top-4 right-4 z-10 w-8 h-8 bg-card/80 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors border border-border shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {discount > 0 && (
                      <div className="absolute top-4 left-4 z-10 bg-red-950/80 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800/50 uppercase">
                        -{discount}% OFF
                      </div>
                    )}

                    <Link href={`/products/${item.slug}`} className="block">
                      <div className="relative aspect-product w-full bg-muted rounded-lg overflow-hidden border border-border mb-3">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-foreground line-clamp-1 group-hover:text-[#C19A6B] transition-colors">
                          {item.name}
                        </h3>
                        <p className="font-bold text-xs text-[#C19A6B]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </Link>

                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="w-full mt-3 bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-[11px] uppercase tracking-wider py-2 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> + KERANJANG
                    </Button>
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
