'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Tag, Truck, ShieldCheck, Heart } from 'lucide-react'
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
  
  const addToWishlist = useWishlistStore((s) => s.addItem)
  const removeFromWishlist = useWishlistStore((s) => s.removeItem)
  const hasInWishlist = useWishlistStore((s) => s.hasItem)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-black text-white min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-black text-white min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-neutral-500" />
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-wider text-white mb-3">
          KERANJANG ANDA KOSONG
        </h1>
        <p className="text-neutral-400 text-xs md:text-sm max-w-md mx-auto mb-8">
          Temukan dompet dan aksesoris kulit premium favorit Anda di catalog kami.
        </p>
        <Link href="/products" className="bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-lg flex items-center gap-2">
          Mulai Belanja <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen py-10">
      <div className="container-raxie">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/products" className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold uppercase tracking-wider text-white">
            KERANJANG BELANJA
          </h1>
          <span className="bg-[#C19A6B] text-black text-xs font-extrabold px-2.5 py-0.5 rounded-full ml-2">
            {cartItems.length} Item
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
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#121212] rounded-xl border border-neutral-800 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 bg-black rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="space-y-1">
                        <Link href={`/products/${item.slug}`} className="font-bold text-xs uppercase tracking-wider text-white hover:text-[#C19A6B] transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-[11px] text-neutral-400">Varian: {item.variantName}</p>
                        )}
                        <p className="text-xs font-bold text-[#C19A6B] pt-0.5">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-neutral-800 pt-3 sm:pt-0">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-neutral-800 rounded bg-black px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-sm text-white">{formatPrice(item.price * item.quantity)}</p>
                        <div className="flex items-center justify-end gap-3 mt-1">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-red-400 text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary Box */}
          <div className="w-full lg:w-[360px] bg-[#121212] border border-neutral-800 rounded-2xl p-6 sticky top-24 space-y-6">
            <h2 className="font-serif font-bold text-base uppercase tracking-wider text-[#C19A6B] pb-3 border-b border-neutral-800">
              RINGKASAN PESANAN
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal ({cartItems.length} item)</span>
                <span className="font-bold text-white">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Ongkos Kirim</span>
                <span className="text-neutral-500 text-[11px]">Dihitung saat checkout</span>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex justify-between items-center">
                <span className="font-bold text-sm text-white uppercase tracking-wider">TOTAL</span>
                <span className="font-bold text-xl text-[#C19A6B]">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="w-full bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2">
                LANJUT KE PEMBAYARAN <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="pt-2 text-center space-y-2 text-[11px] text-neutral-400 border-t border-neutral-800">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C19A6B]" />
                <span>Transaksi 100% Terlindungi & Aman</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
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
