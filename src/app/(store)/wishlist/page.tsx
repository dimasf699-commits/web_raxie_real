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
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function WishlistPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { items, removeItem } = useWishlistStore()
  const addCartItem = useCartStore((s) => s.addItem)

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
  }

  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Wishlist', href: '/wishlist' },
          ]}
        />

        <div className="mt-8">
          <h1 className="font-serif font-bold text-3xl text-foreground mb-8">
            Daftar Keinginan{isMounted && items.length > 0 ? ` (${items.length})` : ''}
          </h1>

          {!isMounted ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-8 h-8 border-4 border-tan-200 border-t-tan-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2">Wishlist Masih Kosong</h2>
              <p className="text-muted-foreground mb-6">
                Anda belum menyimpan produk apapun. Klik ikon hati ❤️ di kartu produk untuk menyimpannya di sini.
              </p>
              <Button asChild variant="brand">
                <Link href="/products">Jelajahi Koleksi</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => {
                const discount = item.compareAtPrice
                  ? getDiscountPercent(item.compareAtPrice, item.price)
                  : 0
                return (
                  <div key={item.productId} className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Remove btn */}
                    <button
                      onClick={() => {
                        removeItem(item.productId)
                        toast.success('Dihapus dari wishlist', item.name)
                      }}
                      className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {discount > 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge variant="sale">-{discount}%</Badge>
                      </div>
                    )}

                    <Link href={`/products/${item.slug}`} className="block">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm text-foreground line-clamp-2">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-tan-600 text-sm">{formatPrice(item.price)}</span>
                          {item.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(item.compareAtPrice)}</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="px-3 pb-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-xl border border-tan-400 text-tan-600 hover:bg-tan-50 dark:hover:bg-tan-900/20 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Tambah ke Keranjang
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
