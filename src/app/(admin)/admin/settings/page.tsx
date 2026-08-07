'use client'

import { useState } from 'react'
import { Store, Mail, Phone, MapPin, Globe, Trash2, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

export default function AdminSettingsPage() {
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null)

  const handleResetData = async (target: 'ORDERS' | 'CHAT' | 'ALL', labelName: string) => {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS PERMANEN seluruh ${labelName}? Data testing akan dibersihkan 100% agar toko Raxie siap digunakan di lingkungan produksi.`)) {
      return
    }

    setLoadingTarget(target)
    try {
      const res = await fetch('/api/admin/reset-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || `Berhasil membersihkan ${labelName}!`)
      } else {
        toast.error(data.error || 'Gagal membersihkan data')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi server')
    } finally {
      setLoadingTarget(null)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Pengaturan Toko & Pembersihan Data</h1>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi toko dan fitur pembersihan data tes (Clean Reset) sebelum rilis resmi</p>
      </div>

      {/* Clean Reset Data Section */}
      <div className="bg-rose-950/10 border-2 border-rose-500/30 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-rose-200 dark:border-rose-900/40">
          <div className="w-10 h-10 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center font-bold">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-rose-700 dark:text-rose-300">Pembersihan Data Tes / Dummy (Persiapan Launching)</h3>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80">Hapus data pesanan palsu dan chat percobaan selama masa pengujian agar toko 100% bersih untuk transaksi asli</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            disabled={loadingTarget !== null}
            onClick={() => handleResetData('ORDERS', 'Data Pesanan Tes')}
            className="p-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loadingTarget === 'ORDERS' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus Pesanan Tes
          </button>

          <button
            type="button"
            disabled={loadingTarget !== null}
            onClick={() => handleResetData('CHAT', 'Data Live Chat Tes')}
            className="p-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {loadingTarget === 'CHAT' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus Chat CS Tes
          </button>

          <button
            type="button"
            disabled={loadingTarget !== null}
            onClick={() => handleResetData('ALL', 'SELURUH Data Tes (Pesanan & Chat)')}
            className="p-3.5 bg-slate-950 hover:bg-slate-900 border border-amber-500/40 disabled:opacity-50 text-amber-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loadingTarget === 'ALL' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            Clean Reset SEMUA
          </button>
        </div>
      </div>

      {/* Info Toko */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Informasi Toko Raxie</h3>
            <p className="text-sm text-slate-500">Detail umum toko Raxie</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Toko</label>
            <input defaultValue="Raxie" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Toko</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input defaultValue="hello@raxie.my.id" className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Kontak Toko</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input defaultValue="082128862433" className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Toko</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea rows={2} className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                defaultValue="Jakarta, Indonesia" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input defaultValue="https://raxie.my.id" className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
