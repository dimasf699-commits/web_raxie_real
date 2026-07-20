'use client'

import { useState } from 'react'
import { X, Truck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/Toaster'

interface TrackingModalProps {
  orderId: string | null
  onClose: () => void
  onSuccess?: () => void
}

export function TrackingModal({ orderId, onClose, onSuccess }: TrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courierName, setCourierName] = useState('JNE')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !trackingNumber) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, courierName, courierCode: courierName.toLowerCase().replace(/\s/g,''), status: 'SHIPPED' })
      })

      if (!res.ok) throw new Error('Gagal memperbarui resi')
      
      toast.success('Nomor resi berhasil ditambahkan')
      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      toast.error('Gagal memperbarui resi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {orderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card w-full max-w-md rounded-2xl p-6 shadow-xl border border-border"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-tan-50 dark:bg-tan-900/30 text-tan-600 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">Update Resi Pengiriman</h3>
                <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Kurir Pengiriman</label>
                <select 
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tan-500"
                >
                  <option value="JNE">JNE</option>
                  <option value="J&T">J&T Express</option>
                  <option value="SICEPAT">SiCepat</option>
                  <option value="ANTERAJA">AnterAja</option>
                  <option value="GOSEND">GoSend</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">Nomor Resi</label>
                <input 
                  type="text" 
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Masukkan nomor resi..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tan-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" variant="brand" className="flex-1" disabled={!trackingNumber || isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Resi'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
