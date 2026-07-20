'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Tag, Loader2, ToggleLeft, ToggleRight, Trash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '', name: '', type: 'PERCENTAGE', value: '', minPurchase: '', usageLimit: '', expiresAt: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchVouchers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/vouchers?admin=1')
      const data = await res.json()
      setVouchers(Array.isArray(data) ? data : data.vouchers ?? [])
    } catch {
      //
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchVouchers() }, [fetchVouchers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : 0,
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      })
      if (res.ok) {
        toast.success('Voucher berhasil dibuat')
        setShowForm(false)
        setForm({ code: '', name: '', type: 'PERCENTAGE', value: '', minPurchase: '', usageLimit: '', expiresAt: '' })
        fetchVouchers()
      } else {
        const d = await res.json()
        toast.error(d.message || 'Gagal membuat voucher')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Voucher & Promo</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola kode diskon untuk pelanggan Anda</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Buat Voucher
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Voucher Baru</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Voucher *</label>
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500 font-mono"
                placeholder="DISKON50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Voucher *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                placeholder="Diskon 50% Semua Produk" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500">
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                <option value="FREE_SHIPPING">Gratis Ongkir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nilai *</label>
              <input required type="number" min="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                placeholder={form.type === 'PERCENTAGE' ? '50 (= 50%)' : '25000 (= Rp25.000)'} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min. Pembelian (Rp)</label>
              <input type="number" min="0" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                placeholder="100000 (opsional)" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Batas Penggunaan</label>
              <input type="number" min="1" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                placeholder="100 (kosong = unlimited)" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Berlaku Sampai</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Voucher'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-tan-500" />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada voucher</p>
            <p className="text-slate-400 text-sm mt-1">Klik tombol "Buat Voucher" untuk membuat kode diskon pertama</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Kode</th>
                  <th className="px-6 py-4 font-semibold">Diskon</th>
                  <th className="px-6 py-4 font-semibold">Min. Belanja</th>
                  <th className="px-6 py-4 font-semibold">Digunakan</th>
                  <th className="px-6 py-4 font-semibold">Expired</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold font-mono text-slate-800 dark:text-foreground">{v.code}</p>
                      <p className="text-xs text-slate-400">{v.name}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-tan-700">
                      {v.type === 'PERCENTAGE' ? `${v.value}%` :
                       v.type === 'FREE_SHIPPING' ? 'Gratis Ongkir' :
                       formatPrice(v.value)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {v.minPurchase > 0 ? formatPrice(v.minPurchase) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.usageCount} {v.usageLimit ? `/ ${v.usageLimit}` : ''}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('id-ID') : 'Tidak ada'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {v.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
