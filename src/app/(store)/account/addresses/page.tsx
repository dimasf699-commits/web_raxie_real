'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, CheckCircle2, Loader2, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'

type Address = {
  id: string
  label: string
  recipientName: string
  phone: string
  street: string
  district: string
  city: string
  province: string
  postalCode: string
  areaId: string | null
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [form, setForm] = useState({
    label: 'Rumah',
    recipientName: '',
    phone: '',
    street: '',
    searchArea: '',
    areaId: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false,
  })

  // Area Search State
  const [areaResults, setAreaResults] = useState<any[]>([])
  const [isSearchingArea, setIsSearchingArea] = useState(false)
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/account/addresses')
      const data = await res.json()
      setAddresses(data.addresses || [])
    } catch {
      toast.error('Gagal memuat alamat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  // Debounced search for Biteship Areas
  useEffect(() => {
    if (form.searchArea.length < 3) {
      setAreaResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingArea(true)
      try {
        const res = await fetch(`/api/shipping/locations?q=${encodeURIComponent(form.searchArea)}`)
        const data = await res.json()
        setAreaResults(data.locations || [])
        setShowAreaDropdown(true)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearchingArea(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [form.searchArea])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recipientName || !form.phone || !form.street || !form.areaId) {
      toast.error('Nama, HP, Alamat Lengkap, dan Kecamatan wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal menyimpan alamat')
      }
      toast.success('Alamat berhasil ditambahkan!')
      setShowModal(false)
      setForm({
        label: 'Rumah',
        recipientName: '',
        phone: '',
        street: '',
        searchArea: '',
        areaId: '',
        district: '',
        city: '',
        province: '',
        postalCode: '',
        isDefault: false,
      })
      fetchAddresses()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Alamat Saya</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola alamat pengiriman untuk mempermudah checkout</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Alamat
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-tan-500" /> Memuat alamat...
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-semibold text-base mb-1">Belum ada alamat tersimpan</h3>
          <p className="text-muted-foreground text-sm mb-4">Tambahkan alamat agar kamu tidak perlu mengisi ulang saat checkout.</p>
          <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Tambah Alamat Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-tan-50 dark:bg-tan-950/30 text-tan-700 dark:text-tan-300 border border-tan-200">
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Utama
                  </span>
                )}
              </div>

              <div>
                <p className="font-bold text-foreground">{addr.recipientName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{addr.phone}</p>
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{addr.street}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {[addr.district, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Alamat */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-foreground">Tambah Alamat Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Label Alamat</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Rumah / Kantor / Kos"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Nama Penerima *</label>
                  <input
                    type="text"
                    required
                    value={form.recipientName}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    placeholder="Budi Santoso"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">No. HP / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Kecamatan Tujuan *</label>
                <input
                  type="text"
                  required
                  value={form.searchArea}
                  onChange={(e) => {
                    setForm({ ...form, searchArea: e.target.value, areaId: '' })
                  }}
                  onFocus={() => { if (areaResults.length > 0) setShowAreaDropdown(true) }}
                  placeholder="Ketik nama kecamatan..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm"
                />
                {isSearchingArea && <p className="text-xs text-muted-foreground mt-1 absolute right-3 top-8">Mencari...</p>}

                {showAreaDropdown && areaResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {areaResults.map((area) => (
                      <div
                        key={area.id}
                        className="px-4 py-2.5 hover:bg-muted cursor-pointer border-b border-border last:border-0 text-sm"
                        onClick={() => {
                          setForm({
                            ...form,
                            searchArea: `${area.name}, ${area.administrative_division_level_2_name}`,
                            areaId: area.id,
                            district: area.name,
                            city: area.administrative_division_level_2_name,
                            province: area.administrative_division_level_1_name,
                            postalCode: String(area.postal_code || ''),
                          })
                          setShowAreaDropdown(false)
                        }}
                      >
                        <p className="font-medium">{area.name}</p>
                        <p className="text-xs text-muted-foreground">{area.administrative_division_level_2_name}, {area.administrative_division_level_1_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Alamat Lengkap *</label>
                <textarea
                  required
                  rows={3}
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm resize-none"
                ></textarea>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-tan-500 rounded"
                />
                <span className="text-sm font-medium">Jadikan Alamat Utama</span>
              </label>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting} loading={isSubmitting}>Simpan Alamat</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
