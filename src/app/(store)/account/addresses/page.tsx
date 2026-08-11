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
          <h1 className="font-serif text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-black dark:text-white">Alamat Saya</h1>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">Kelola alamat pengiriman untuk mempermudah checkout</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider px-4 py-3 rounded-sm transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> TAMBAH ALAMAT
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-tan-500" /> Memuat alamat...
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800">
          <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">Belum ada alamat tersimpan</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-6 font-medium">Tambahkan alamat agar kamu tidak perlu mengisi ulang saat checkout.</p>
          <button onClick={() => setShowModal(true)} className="bg-transparent border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-[11px] uppercase tracking-wider px-6 py-3 rounded-sm transition-colors flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> TAMBAH ALAMAT PERTAMA
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm p-5 shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold bg-[#FAF9F6] dark:bg-[#121212] text-[#C19A6B] border border-[#C19A6B]/30 uppercase tracking-wider">
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> UTAMA
                  </span>
                )}
              </div>

              <div>
                <p className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">{addr.recipientName}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">{addr.phone}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">{addr.street}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
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
          <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 w-full max-w-lg rounded-sm p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-3">Tambah Alamat Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 block">Label Alamat</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Rumah / Kantor / Kos"
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 block">Nama Penerima *</label>
                  <input
                    type="text"
                    required
                    value={form.recipientName}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    placeholder="Budi Santoso"
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 block">No. HP / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 block">Kecamatan Tujuan *</label>
                <input
                  type="text"
                  required
                  value={form.searchArea}
                  onChange={(e) => {
                    setForm({ ...form, searchArea: e.target.value, areaId: '' })
                  }}
                  onFocus={() => { if (areaResults.length > 0) setShowAreaDropdown(true) }}
                  placeholder="Ketik nama kecamatan..."
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                {isSearchingArea && <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-1 absolute right-3 top-8">Mencari...</p>}

                {showAreaDropdown && areaResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-xl max-h-48 overflow-y-auto">
                    {areaResults.map((area) => (
                      <div
                        key={area.id}
                        className="px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer border-b border-neutral-200 dark:border-neutral-800 last:border-0 text-xs"
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
                        <p className="font-bold text-black dark:text-white uppercase tracking-wider">{area.name}</p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{area.administrative_division_level_2_name}, {area.administrative_division_level_1_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 block">Alamat Lengkap *</label>
                <textarea
                  required
                  rows={3}
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                ></textarea>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#121212] dark:accent-white rounded-sm"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Jadikan Alamat Utama</span>
              </label>

              <div className="flex gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button type="button" className="flex-1 bg-transparent border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-[11px] uppercase tracking-wider px-4 py-3 rounded-sm transition-colors" onClick={() => setShowModal(false)}>BATAL</button>
                <button type="submit" className="flex-1 bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider px-4 py-3 rounded-sm transition-colors disabled:opacity-50" disabled={isSubmitting}>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN ALAMAT'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
