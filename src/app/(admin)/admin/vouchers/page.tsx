'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Tag, Loader2, ToggleLeft, ToggleRight, Trash2, Edit3, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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
      toast.error('Gagal memuat daftar voucher')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchVouchers() }, [fetchVouchers])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({ code: '', name: '', type: 'PERCENTAGE', value: '', minPurchase: '', usageLimit: '', expiresAt: '' })
    setShowForm(true)
  }

  const handleOpenEdit = (v: any) => {
    setEditingId(v.id)
    setForm({
      code: v.code || '',
      name: v.name || '',
      type: v.type || 'PERCENTAGE',
      value: v.value !== undefined ? String(v.value) : '',
      minPurchase: v.minPurchase !== undefined ? String(v.minPurchase) : '',
      usageLimit: v.usageLimit !== undefined && v.usageLimit !== null ? String(v.usageLimit) : '',
      expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString().slice(0, 16) : '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const isEdit = Boolean(editingId)
    const url = isEdit ? `/api/vouchers/${editingId}` : '/api/vouchers'
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : 0,
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
          expiresAt: (form.expiresAt && !isNaN(Date.parse(form.expiresAt))) ? form.expiresAt : null,
        }),
      })
      if (res.ok) {
        toast.success(isEdit ? 'Voucher berhasil diperbarui' : 'Voucher berhasil dibuat')
        setShowForm(false)
        setEditingId(null)
        setForm({ code: '', name: '', type: 'PERCENTAGE', value: '', minPurchase: '', usageLimit: '', expiresAt: '' })
        fetchVouchers()
      } else {
        const d = await res.json()
        toast.error(d.message || d.error || 'Gagal menyimpan voucher')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      if (res.ok) {
        toast.success(`Voucher ${!currentActive ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchVouchers()
      } else {
        toast.error('Gagal mengubah status voucher')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus voucher "${code}"?`)) return
    try {
      const res = await fetch(`/api/vouchers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Voucher berhasil dihapus')
        fetchVouchers()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Gagal menghapus voucher')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Voucher &amp; Promo</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola, edit, dan hapus kode diskon toko Anda</p>
        </div>
        <Button className="gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Buat Voucher Baru
        </Button>
      </div>

      {/* Create / Edit Form Modal Card */}
      {showForm && (
        <div className="bg-white dark:bg-card border-2 border-amber-500/30 rounded-2xl p-6 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="font-bold text-lg text-slate-800 dark:text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              {editingId ? 'Edit Voucher' : 'Voucher Baru'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Kode Voucher *</label>
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                placeholder="DISKON50" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nama Voucher *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Diskon 50% Semua Produk" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tipe Diskon *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                <option value="FREE_SHIPPING">Gratis Ongkir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nilai Diskon *</label>
              <input required type="number" min="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                placeholder={form.type === 'PERCENTAGE' ? '50 (= 50%)' : '25000 (= Rp25.000)'} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Min. Pembelian (Rp)</label>
              <input type="number" min="0" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="100000 (kosong = tanpa minimum)" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Batas Penggunaan Total</label>
              <input type="number" min="1" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="100 (kosong = unlimited)" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1">Masa Kadaluarsa (Tanggal &amp; Waktu)</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update Voucher' : 'Simpan Voucher')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Vouchers Table List */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada voucher</p>
            <p className="text-slate-400 text-sm mt-1">Klik tombol "Buat Voucher Baru" untuk membuat kode diskon pertama</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Kode &amp; Nama Voucher</th>
                  <th className="px-6 py-4 font-semibold">Nilai Diskon</th>
                  <th className="px-6 py-4 font-semibold">Min. Belanja</th>
                  <th className="px-6 py-4 font-semibold">Penggunaan</th>
                  <th className="px-6 py-4 font-semibold">Kadaluarsa</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi &amp; Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold font-mono text-slate-900 dark:text-foreground text-sm flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                        {v.code}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{v.name}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-700 dark:text-amber-400">
                      {v.type === 'PERCENTAGE' ? `${v.value}%` :
                       v.type === 'FREE_SHIPPING' ? 'Gratis Ongkir' :
                       formatPrice(v.value)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.minPurchase > 0 ? formatPrice(v.minPurchase) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {v.usageCount} {v.usageLimit ? `/ ${v.usageLimit}` : '(Unlimited)'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Selamanya'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(v.id, v.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                          v.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title="Klik untuk ubah status aktif/nonaktif"
                      >
                        {v.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                        {v.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(v)}
                          className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50 gap-1.5 font-bold"
                          title="Edit Voucher"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(v.id, v.code)}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Hapus Voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </Button>
                      </div>
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
