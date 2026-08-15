'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Truck, ShieldCheck } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const cartItems = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const totalPrice = useCartStore((s) => s.totalPrice())
  
  const hasInWishlist = useWishlistStore((s) => s.hasItem)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 transition-colors duration-300">
        <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center mb-6 text-neutral-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-black dark:text-white mb-3">
          KERANJANG ANDA KOSONG
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium max-w-md mx-auto mb-8">
          Temukan dompet dan aksesoris kulit premium favorit Anda di katalog kami.
        </p>
        <Link href="/products" className="bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-sm flex items-center gap-2 transition-colors">
          Mulai Belanja <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen py-10 transition-colors duration-300">
      <div className="container-raxie">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-black dark:text-white">
            KERANJANG BELANJA
          </h1>
          <span className="bg-[#C19A6B] text-black text-[10px] font-extrabold px-2.5 py-1 rounded-sm ml-2 tracking-wider">
            {cartItems.length} ITEM
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cart Items List */}
          <div className="flex-1 w-full space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => {
                const inWishlist = hasInWishlist(item.productId)

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-row items-center justify-between p-3.5 sm:p-5 bg-white dark:bg-[#151515] rounded-xl border border-neutral-200 dark:border-neutral-800 gap-3 sm:gap-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-neutral-50 dark:bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <Link href={`/products/${item.slug}`} className="font-bold text-[11px] sm:text-xs uppercase tracking-wider text-black dark:text-white hover:text-[#C19A6B] transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Varian: {item.variantName}</p>
                        )}
                        <p className="text-xs font-bold text-[#C19A6B]">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-2 sm:gap-8 shrink-0">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-black dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 flex items-center justify-center text-neutral-500 hover:text-black dark:hover:text-white text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <p className="font-bold text-xs sm:text-sm text-black dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                          aria-label="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary Box */}
          <div className="w-full lg:w-[360px] bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 sticky top-24 space-y-6 shadow-sm">
            <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-[#C19A6B] pb-4 border-b border-neutral-200 dark:border-neutral-800">
              RINGKASAN PESANAN
            </h2>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Subtotal ({cartItems.length} item)</span>
                <span className="font-bold text-black dark:text-white">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <span>Ongkos Kirim</span>
                <span className="text-[11px]">Dihitung saat checkout</span>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between items-center">
                <span className="font-bold text-sm text-black dark:text-white uppercase tracking-wider">TOTAL</span>
                <span className="font-bold text-xl text-[#C19A6B]">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-2 transition-colors">
                LANJUT KE PEMBAYARAN <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="pt-4 text-center space-y-2 text-[11px] text-neutral-400 font-medium border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C19A6B]" />
                <span>Transaksi 100% Terlindungi & Aman</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#C19A6B]" />
                <span>Pengiriman Otomatis & Terlacak</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
