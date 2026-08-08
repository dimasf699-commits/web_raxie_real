'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Package, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart.store'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    totalPrice,
  } = useCartStore()

  const [voucherCode, setVoucherCode] = useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return
    setIsApplyingVoucher(true)
    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, cartSubtotal: totalPrice() })
      })
      const data = await res.json()
      
      if (data.error) {
        toast.error(data.error)
        setAppliedVoucher(null)
      } else if (data.success) {
        setAppliedVoucher(data.voucher)
        toast.success(`Voucher ${data.voucher.name} berhasil digunakan!`)
      }
    } catch (err) {
      toast.error('Gagal memvalidasi voucher')
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const finalPrice = appliedVoucher 
    ? Math.max(0, totalPrice() - appliedVoucher.discountAmount) 
    : totalPrice()

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#121212] text-white shadow-2xl flex flex-col border-l border-neutral-800"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-bold text-lg tracking-wider uppercase text-white">
                  KERANJANG ANDA
                </h2>
                <span className="bg-[#C19A6B] text-black text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="text-neutral-400 hover:text-white transition-colors p-1"
                aria-label="Tutup keranjang"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Top Security Banner */}
            <div className="mx-6 mt-4 p-3 rounded-lg border border-[#C19A6B]/40 bg-[#1A1815] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C19A6B]/10 flex items-center justify-center shrink-0 border border-[#C19A6B]/30">
                <ShieldCheck className="h-4 w-4 text-[#C19A6B]" />
              </div>
              <div className="text-xs leading-tight">
                <p className="font-semibold text-[#E5C396]">Belanja aman & terpercaya</p>
                <p className="text-neutral-400 text-[11px] mt-0.5">Semua transaksi dilindungi 100% secure</p>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-neutral-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-white">
                      Keranjang Anda kosong
                    </h3>
                    <p className="text-neutral-400 text-xs mt-1 max-w-[240px]">
                      Temukan produk aksesoris kulit premium favorit Anda.
                    </p>
                  </div>
                  <Button
                    onClick={closeCart}
                    asChild
                    className="mt-4 bg-[#C19A6B] text-black hover:bg-[#b08b5c] font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-lg"
                  >
                    <Link href="/products">Mulai Belanja</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 p-3 rounded-xl bg-[#1A1A1A] border border-neutral-800/80 items-center"
                      >
                        {/* Product Image */}
                        <div className="relative w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-neutral-800">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="font-medium text-xs text-white hover:text-[#C19A6B] transition-colors line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          <div className="font-bold text-xs text-neutral-200 mt-1">
                            {formatPrice(item.price)}
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-neutral-700 rounded bg-black px-2 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                              aria-label="Hapus item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-[#121212] space-y-4">
                {/* Voucher Input */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Kode voucher (contoh: RAXIE20)" 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={!!appliedVoucher || isApplyingVoucher}
                    className="flex-1 uppercase text-xs border border-neutral-800 rounded-lg px-3 py-2 bg-black text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#C19A6B]"
                  />
                  {appliedVoucher ? (
                    <button 
                      className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 bg-red-950/30 rounded-lg px-3 py-2 font-medium"
                      onClick={() => { setAppliedVoucher(null); setVoucherCode('') }}
                    >
                      Hapus
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode || isApplyingVoucher}
                      className="border border-[#C19A6B]/50 text-[#C19A6B] hover:bg-[#C19A6B] hover:text-black rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      Terapkan
                    </button>
                  )}
                </div>

                {/* Subtotal & Total Summary */}
                <div className="space-y-2 text-xs border-t border-neutral-800/80 pt-3">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">{formatPrice(totalPrice())}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-[#C19A6B] font-medium">
                      <span>Voucher: {appliedVoucher.name}</span>
                      <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-400">
                    <span>Ongkos Kirim</span>
                    <span className="text-neutral-500 text-[11px]">Dihitung saat checkout</span>
                  </div>

                  <div className="border-t border-neutral-800 pt-3 flex justify-between items-center">
                    <span className="font-bold text-sm text-white">Total</span>
                    <span className="font-bold text-lg text-[#C19A6B]">{formatPrice(finalPrice)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-1">
                    <Truck className="h-3.5 w-3.5 text-[#C19A6B] shrink-0" />
                    <span>Gratis ongkir untuk pembelian minimal Rp 100.000</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="space-y-2 pt-1">
                  <Button 
                    asChild 
                    className="w-full bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2"
                    onClick={closeCart}
                  >
                    <Link href="/checkout">
                      Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full border-neutral-700 text-white hover:bg-neutral-900 font-semibold text-xs py-2.5 rounded-lg"
                    onClick={closeCart}
                  >
                    <Link href="/cart">Lihat Detail Keranjang</Link>
                  </Button>
                </div>

                {/* Bottom Trust Badges */}
                <div className="grid grid-cols-3 gap-2 border-t border-neutral-800/80 pt-4 text-center text-[10px] text-neutral-400">
                  <div className="flex flex-col items-center gap-1">
                    <Award className="h-4 w-4 text-[#C19A6B]" />
                    <span className="font-bold text-neutral-200">100% Original</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">Produk original & berkualitas</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-[#C19A6B]" />
                    <span className="font-bold text-neutral-200">Garansi 1 Tahun</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">Untuk setiap produk</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Package className="h-4 w-4 text-[#C19A6B]" />
                    <span className="font-bold text-neutral-200">Packing Premium</span>
                    <span className="text-[9px] text-neutral-500 leading-tight">Aman & eksklusif</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
