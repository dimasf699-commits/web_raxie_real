'use client'

import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { CreditCard } from 'lucide-react'

export function PayNowButton({ snapToken }: { snapToken: string }) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePay = () => {
    if (!snapToken) {
      alert('Token pembayaran tidak valid.')
      return
    }

    if (typeof window !== 'undefined' && (window as any).snap) {
      setIsProcessing(true)
      ;(window as any).snap.pay(snapToken, {
        onSuccess: function (result: any) {
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
