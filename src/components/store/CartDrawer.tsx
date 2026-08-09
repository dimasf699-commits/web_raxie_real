'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Award } from 'lucide-react'
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card text-card-foreground shadow-2xl flex flex-col border-l border-border transition-colors duration-300"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-bold text-base tracking-wider uppercase text-foreground">
                  KERANJANG ANDA
                </h2>
                <span className="bg-[#C19A6B] text-black text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Tutup keranjang"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Security Banner */}
            <div className="bg-muted px-6 py-2.5 border-b border-border flex items-center gap-2 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-[#C19A6B] shrink-0" />
              <span>Belanja aman & terpercaya - Semua transaksi 100% terlindungi</span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="font-bold text-xs uppercase text-foreground">Keranjang Anda Masih Kosong</p>
                  <p className="text-xs text-muted-foreground">Jelajahi koleksi dompet dan tas kulit kami untuk menemukan produk favorit Anda.</p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="inline-block bg-[#C19A6B] text-black font-bold text-xs uppercase px-6 py-2.5 rounded-lg mt-2 hover:bg-[#b08b5c]"
                  >
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                    <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                      <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-bold text-xs uppercase tracking-wider text-foreground hover:text-[#C19A6B] truncate"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-red-500 text-xs ml-2 shrink-0"
                          aria-label="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.variantName && (
                        <p className="text-[11px] text-muted-foreground">Warna: {item.variantName}</p>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center border border-border rounded bg-background px-2 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground text-xs disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-xs text-[#C19A6B]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-6 bg-card border-t border-border space-y-4">
                {/* Voucher Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kode voucher (contoh: RAXIE20)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground uppercase font-mono focus:outline-none focus:border-[#C19A6B]"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                    className="bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase px-4 rounded-lg disabled:opacity-50"
                  >
                    {isApplyingVoucher ? '...' : 'TERAPKAN'}
                  </button>
                </div>

                {/* Summary */}
                <div className="space-y-1.5 text-xs pt-2 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">{formatPrice(totalPrice())}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-[#C19A6B]">
                      <span>Diskon Voucher ({appliedVoucher.code})</span>
                      <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Ongkos Kirim</span>
                    <span className="text-muted-foreground text-[11px]">Dihitung di checkout</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="font-bold uppercase tracking-wider text-foreground">TOTAL</span>
                    <span className="font-bold text-xl text-[#C19A6B]">{formatPrice(finalPrice)}</span>
                  </div>
                </div>

                {/* Primary CTA */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  LANJUT KE PEMBAYARAN <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full border border-border hover:border-foreground text-foreground font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center transition-colors block text-center"
                >
                  LIHAT DETAIL KERANJANG
                </Link>

                {/* Bottom Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-[10px] text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#C19A6B]" />
                    <span>100% Original</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C19A6B]" />
                    <span>Garansi 1 Tahun</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#C19A6B]" />
                    <span>Packing Premium</span>
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
