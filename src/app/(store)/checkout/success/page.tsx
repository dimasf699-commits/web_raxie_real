'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CircleCheck, Package, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cart.store'

function CheckoutSuccessContent() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState('')
  const clearCart = useCartStore(state => state.clearCart)

  useEffect(() => {
    setMounted(true)
    const orderFromUrl = searchParams.get('order')
    const statusFromUrl = searchParams.get('status')
    if (orderFromUrl) {
      setOrderId(orderFromUrl)
    } else {
      setOrderId(`INV-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`)
    }
    if (statusFromUrl) setStatus(statusFromUrl)

    if (statusFromUrl !== 'failed' && statusFromUrl !== 'pending') {
      clearCart()
    }
  }, [searchParams, clearCart])

  if (!mounted) return null

  const isPending = status === 'pending'
  const isFailed = status === 'failed'

  return (
    <div className="container-raxie py-16 md:py-32 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm text-center relative overflow-hidden">
        {/* Decorative background circle */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl -z-10 ${
          isPending ? 'bg-orange-50 dark:bg-orange-900/20' : 
          isFailed ? 'bg-red-50 dark:bg-red-900/20' : 
          'bg-green-50 dark:bg-green-900/20'
        }`}></div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isPending ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' :
            isFailed ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' :
            'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
          }`}
        >
          <CircleCheck className="w-10 h-10" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-3xl font-bold text-foreground mb-2"
        >
          {isPending ? 'Menunggu Pembayaran' : 
           isFailed ? 'Pembayaran Gagal' : 
           'Pesanan Berhasil!'}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8"
        >
          {isPending 
            ? 'Pesanan Anda telah dicatat namun belum dibayar. Silakan lakukan pembayaran melalui menu pesanan.'
            : isFailed 
            ? 'Terjadi masalah atau Anda membatalkan pembayaran. Silakan coba lagi dari menu pesanan Anda.'
            : 'Terakhir, terima kasih telah berbelanja di Raxie. Pesanan Anda sedang diproses dan akan segera dikirim.'}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-muted/50 rounded-xl p-4 mb-8 text-left flex items-center gap-4"
        >
          <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
            <Package className="w-6 h-6 text-tan-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Nomor Pesanan</p>
            <p className="font-mono font-bold text-foreground text-lg">{orderId}</p>
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
              Lanjut Belanja 
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/account/orders" className="w-full">
            <Button variant="outline" className="w-full py-6 rounded-xl text-base">
              Lihat Pesanan Saya
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-raxie py-32 text-center">Memuat...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
