'use client'

import { useState } from 'react'
import { Bell, BellRing, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import { Button } from '@/components/ui/Button'

interface RestockAlertButtonProps {
  productId: string
  variantId: string
}

export function RestockAlertButton({ productId, variantId }: RestockAlertButtonProps) {
  const [email, setEmail] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/restock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, productId, variantId }),
      })
      if (res.ok) {
        setRegistered(true)
        toast.success('Berhasil!', 'Kami akan beritahu kamu saat stok tersedia.')
      } else {
        const data = await res.json()
        toast.error('Gagal', data.error || 'Coba lagi nanti.')
      }
    } catch {
      toast.error('Gagal', 'Terjadi kesalahan. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300">
        <BellRing className="h-4 w-4 shrink-0" />
        <span>Kamu akan dinotifikasi saat stok tersedia!</span>
      </div>
    )
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@kamu.com"
          required
          className="flex-1 px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-tan-500/50"
        />
        <Button type="submit" size="sm" className="shrink-0 rounded-xl" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Beritahu'}
        </Button>
      </form>
    )
  }

  return (
    <Button
      variant="outline"
      className="flex-1 h-12 rounded-xl border-dashed border-muted-foreground/40 text-muted-foreground hover:border-tan-400 hover:text-tan-600 gap-2"
      onClick={() => setShowForm(true)}
    >
      <Bell className="h-4 w-4" />
      Beritahu Saya Saat Restock
    </Button>
  )
}
