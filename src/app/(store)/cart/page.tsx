'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Tag, Truck, ShieldCheck, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { Button } from '@/components/ui/Button'
import { cn, formatPrice } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
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
    return <div className="container-raxie py-12 md:py-24 min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-tan-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-raxie py-12 md:py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-tan-50 rounded-full flex items-center justify-center mb-6 text-tan-400">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Keranjang Anda Kosong</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Sepertinya Anda belum menambahkan dompet atau aksesoris kulit premium kami ke keranjang Anda.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full shadow-md gap-2">
            Mulai Belanja <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-raxie py-8 md:py-16">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/products" className="text-muted-foreground hover:text-tan-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-serif text-3xl font-bold text-foreground">Keranjang Belanja</h1>
        <span className="bg-tan-100 text-tan-700 text-xs font-bold px-2.5 py-1 rounded-full ml-2">
          {cartItems.length} Item
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Cart Items List */}
        <div className="flex-1 w-full space-y-6">
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-6">Produk</div>
            <div className="col-span-3 text-center">Kuantitas</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <AnimatePresence>
            {cartItems.map((item) => {
              const inWishlist = hasInWishlist(item.productId)

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center py-4 md:py-6 border-b border-border/60"
                >
                  {/* Product Info */}
                  <div className="col-span-6 flex items-start gap-4">
                    <Link href={`/products/${item.slug}`} className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 96px, 128px"
                      />
                    </Link>
                    <div className="flex flex-col h-full justify-between py-1">
                      <div>
                        <Link href={`/products/${item.slug}`} className="font-semibold text-base md:text-lg text-foreground hover:text-tan-500 transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground mt-1">Warna: {item.variantName}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 text-xs md:text-sm">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Hapus</span>
                        </button>
                        <button
                          onClick={() => {
                            if (inWishlist) removeFromWishlist(item.productId)
                            else addToWishlist({
                              productId: item.productId,
                              name: item.name,
                              slug: item.slug,
                              price: item.price,
                              image: item.image,
                            })
                          }}
                          className={cn(
                            "flex items-center gap-1.5 transition-colors",
                            inWishlist ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
                          <span>{inWishlist ? 'Tersimpan' : 'Simpan'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Mobile Price */}
                  <div className="col-span-3 flex items-center justify-between md:justify-center mt-4 md:mt-0">
                    <span className="md:hidden font-medium text-foreground">{formatPrice(item.price)}</span>
                    <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden h-10 w-[110px]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex-1 flex items-center justify-center hover:bg-muted transition-colors text-lg"
                      >
                        -
                      </button>
                      <span className="flex-1 flex items-center justify-center font-medium text-sm border-x border-border">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex-1 flex items-center justify-center hover:bg-muted transition-colors text-lg"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Desktop Total */}
                  <div className="hidden md:flex col-span-3 justify-end">
                    <span className="font-semibold text-lg text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <div className="pt-6">
            <div className="flex items-start gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <ShieldCheck className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-400 text-sm">Garansi Kulit Asli 1 Tahun</h4>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">Semua produk Raxie dilindungi garansi resmi. Jika kulit terkelupas dalam 1 tahun, kami ganti baru.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[380px] bg-card border border-border shadow-sm rounded-2xl p-6 sticky top-24">
          <h2 className="font-serif font-bold text-xl text-foreground mb-6">Ringkasan Pesanan</h2>

          {/* Promo Code placeholder */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Punya Kode Promo?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan kode"
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400 transition-all uppercase"
              />
              <Button variant="outline">Terapkan</Button>
            </div>
          </div>

          <div className="space-y-4 text-sm mb-6 border-b border-border pb-6">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({cartItems.length} item)</span>
              <span className="font-medium text-foreground">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Diskon</span>
              <span className="text-green-600 font-medium">- Rp 0</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                Estimasi Ongkir
              </span>
              <span className="font-medium text-foreground text-right max-w-[120px]">
                Dihitung di checkout
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="font-bold text-foreground">Total Keseluruhan</span>
            <div className="text-right">
              <span className="font-bold text-2xl text-tan-600 dark:text-tan-400">{formatPrice(totalPrice)}</span>
              <p className="text-[10px] text-muted-foreground mt-1">Termasuk pajak (jika ada)</p>
            </div>
          </div>

          <Link href="/checkout" className="block w-full">
            <Button size="lg" className="w-full rounded-xl py-6 text-base font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              Lanjut ke Pembayaran <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Truck className="w-4 h-4" />
              <span>Pengiriman aman & terasuransi</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 opacity-70">
              {/* Dummy payment icons */}
              <div className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-[8px] font-bold">VISA</div>
              <div className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-[8px] font-bold">BCA</div>
              <div className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-[8px] font-bold">QRIS</div>
              <div className="h-6 w-10 bg-muted rounded border border-border flex items-center justify-center text-[8px] font-bold">GOPAY</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
