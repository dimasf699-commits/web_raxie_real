'use client'

import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import { trackPurchase } from '@/components/analytics/MetaPixel'

export function PayNowButton({ snapToken, orderId, totalAmount, items = [] }: { snapToken: string; orderId?: string; totalAmount?: number; items?: any[] }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePay = () => {
    if (!snapToken) {
      alert('Token pembayaran tidak valid.')
      return
    }

    if (typeof window !== 'undefined' && (window as any).snap) {
      setIsProcessing(true)
      ;(window as any).snap.pay(snapToken, {
        onSuccess: async function (result: any) {
          if (orderId && totalAmount) {
            try {
              const verifyRes = await fetch('/api/orders/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: orderId }),
              })
              const verifyData = await verifyRes.json()
              
              if (verifyData.status === 'PAYMENT_CONFIRMED') {
                trackPurchase(orderId, {
                  value: totalAmount,
                  currency: 'IDR',
                  content_ids: items.map((i: any) => i.productId || i.id),
                  num_items: items.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0)
                })
              }
            } catch(e) {}
          }
          window.location.reload()
        },
        onPending: function (result: any) {
          window.location.reload()
        },
        onError: function (result: any) {
          alert('Pembayaran gagal atau dibatalkan.')
          setIsProcessing(false)
        },
        onClose: function () {
          setIsProcessing(false)
        }
      })
    } else {
      alert('Sistem pembayaran sedang dimuat, silakan coba beberapa detik lagi.')
    }
  }

  return (
    <Button 
      size="sm" 
      onClick={handlePay} 
      disabled={isProcessing}
      className="bg-tan-600 hover:bg-tan-700 text-white gap-2"
    >
      <CreditCard className="w-4 h-4" />
      {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
    </Button>
  )
}
