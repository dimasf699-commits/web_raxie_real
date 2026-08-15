'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CircleCheck, Package, ArrowRight, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart.store'

function CheckoutSuccessContent() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState('')
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    setMounted(true)
    const orderFromUrl = searchParams.get('order')
    const statusFromUrl = searchParams.get('status')
    if (orderFromUrl) {
      setOrderId(orderFromUrl)
    } else {
      setOrderId(`RXE-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`)
    }
    if (statusFromUrl) setStatus(statusFromUrl)

    if (statusFromUrl !== 'failed' && statusFromUrl !== 'pending' && statusFromUrl !== 'cancelled') {
      clearCart()
      if (orderFromUrl) {
        fetch('/api/orders/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: orderFromUrl }),
        }).catch(console.error)
      }
    }
  }, [searchParams, clearCart])

  if (!mounted) return null

  const isPending = status === 'pending'
  const isFailed = status === 'failed' || status === 'cancelled'

  return (
    <div className="container-raxie py-16 md:py-32 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm text-center relative overflow-hidden">
        {/* Decorative background circle */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl -z-10 ${
            isPending
              ? 'bg-amber-500/10'
              : isFailed
              ? 'bg-red-500/10'
              : 'bg-emerald-500/10'
          }`}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPending
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
              : isFailed
              ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-300 dark:border-red-800'
              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
          }`}
        >
          {isPending ? (
            <Clock className="w-10 h-10" />
          ) : isFailed ? (
            <XCircle className="w-10 h-10" />
          ) : (
            <CircleCheck className="w-10 h-10" />
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-3xl font-bold text-foreground mb-2"
        >
          {isPending
            ? 'Menunggu Pembayaran'
            : isFailed
            ? 'Pembayaran Belum Berhasil'
            : 'Pesanan Berhasil!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8 text-sm leading-relaxed"
        >
          {isPending
            ? 'Pesanan Anda telah kami catat. Silakan selesaikan pembayaran sesuai instruksi untuk memproses pesanan Anda.'
            : isFailed
            ? 'Pembayaran tidak terselesaikan atau dibatalkan. Anda dapat mengulangi pembayaran dari menu riwayat pesanan.'
            : 'Terima kasih telah berbelanja di Raxie. Pesanan Anda sedang dipersiapkan dan akan segera kami proses.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-xl p-4 mb-8 text-left flex items-center gap-4 border border-border/50"
        >
          <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
            <Package className="w-6 h-6 text-[#C19A6B]" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Nomor Pesanan</p>
            <p className="font-mono font-bold text-foreground text-base md:text-lg">{orderId}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Link href="/products" className="w-full">
            <Button className="w-full py-6 rounded-xl text-base shadow-sm group">
              {isFailed ? 'Kembali ke Katalog' : 'Lanjut Belanja'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/account/orders" className="w-full">
            <Button variant="outline" className="w-full py-6 rounded-xl text-base">
              Lihat Riwayat Pesanan
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-raxie py-32 text-center text-muted-foreground">Memuat...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
