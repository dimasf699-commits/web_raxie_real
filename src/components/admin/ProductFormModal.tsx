'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'
import { ImageUploader } from '@/components/admin/ImageUploader'

type Category = { id: string; name: string }

interface ProductFormModalProps {
  isOpen: boolean
  product?: any
  onClose: () => void
  onSuccess: () => void
}

const emptyVariant = { sku: '', name: '', color: '', size: '', price: '', stock: '' }

export function ProductFormModal({ isOpen, product, onClose, onSuccess }: ProductFormModalProps) {
  const isEdit = !!product
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', slug: '', description: '', shortDescription: '',
    categoryId: '', basePrice: '', compareAtPrice: '',
    material: '', weight: '', tags: '',
    isFeatured: false, isNew: true, isBestSeller: false,
  })
  const [variants, setVariants] = useState([{ ...emptyVariant }])
  const [imageUrls, setImageUrls] = useState([''])

  // Load categories
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
      setCategories(Array.isArray(data) ? data : data.categories ?? [])
    }).catch(() => {})
  }, [])

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? '',
        slug: product.slug ?? '',
        description: product.description ?? '',
        shortDescription: product.shortDescription ?? '',
        categoryId: product.categoryId ?? '',
        basePrice: String(product.basePrice ?? ''),
        compareAtPrice: String(product.compareAtPrice ?? ''),
        material: product.material ?? '',
        weight: String(product.weight ?? ''),
        tags: (product.tags ?? []).join(', '),
        isFeatured: product.isFeatured ?? false,
        isNew: product.isNew ?? false,
        isBestSeller: product.isBestSeller ?? false,
      })
      setImageUrls(product.images?.map((i: any) => i.url) ?? [''])
      setVariants(product.variants?.length > 0
        ? product.variants.map((v: any) => ({
            sku: v.sku, name: v.name, color: v.color ?? '',
            size: v.size ?? '', price: String(v.price), stock: String(v.stock),
          }))
        : [{ ...emptyVariant }]
      )
    } else {
      setForm({
        name: '', slug: '', description: '', shortDescription: '',
        categoryId: '', basePrice: '', compareAtPrice: '',
        material: '', weight: '', tags: '',
        isFeatured: false, isNew: true, isBestSeller: false,
      })
      setVariants([{ ...emptyVariant }])
      setImageUrls([''])
    }
  }, [product, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    // Auto-generate slug from name
    if (name === 'name') {
      setForm(f => ({ ...f, name: value, slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))
    }
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    setVariants(vs => vs.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.categoryId || !form.basePrice) {
      toast.error('Nama, kategori, dan harga wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      const body = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: imageUrls.filter(Boolean),
        variants: variants.filter(v => v.sku && v.price),
      }

      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Gagal menyimpan produk')
      }

      toast.success(isEdit ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="font-serif font-bold text-lg">
                {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Informasi Produk</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Produk *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                      placeholder="Contoh: Dompet Kulit Premium" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                    <input name="slug" value={form.slug} onChange={handleChange}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500 font-mono"
                      placeholder="dompet-kulit-premium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kategori *</label>
                      <select name="categoryId" value={form.categoryId} onChange={handleChange} required
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500">
                        <option value="">Pilih kategori...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Harga Dasar (Rp) *</label>
                      <input name="basePrice" value={form.basePrice} onChange={handleChange} type="number" required min="0"
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                        placeholder="250000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga Coret (Rp)</label>
                    <input name="compareAtPrice" value={form.compareAtPrice} onChange={handleChange} type="number" min="0"
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                      placeholder="300000 (opsional)" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi Singkat</label>
                    <input name="shortDescription" value={form.shortDescription} onChange={handleChange}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                      placeholder="Deskripsi singkat 1-2 kalimat" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi Lengkap *</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500 resize-none"
                      placeholder="Deskripsi detail produk..." />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Gambar Produk</h4>
                <div className="flex flex-wrap gap-4">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <ImageUploader 
                        currentImage={url}
                        onUploadSuccess={(newUrl) => setImageUrls(us => us.map((u, j) => j === i ? newUrl : u))}
                        onUploadError={(err) => toast.error(err)}
                      />
                      {imageUrls.length > 1 && (
                        <button type="button" onClick={() => setImageUrls(us => us.filter((_, j) => j !== i))}
                          className="absolute -top-2 -right-2 p-1.5 bg-white border border-red-200 text-red-500 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-center">
                    <button type="button" onClick={() => setImageUrls(us => [...us, ''])}
                      className="aspect-square w-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors text-slate-400 hover:text-tan-600">
                      <Plus className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium">Tambah</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Varian Produk</h4>
                {variants.map((v, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 space-y-3 bg-slate-50 dark:bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Varian {i + 1}</span>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => setVariants(vs => vs.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600">
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">SKU *</label>
                        <input value={v.sku} onChange={e => handleVariantChange(i, 'sku', e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500 font-mono"
                          placeholder="SKU-001" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">Nama Varian</label>
                        <input value={v.name} onChange={e => handleVariantChange(i, 'name', e.target.value)}
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                          placeholder="Hitam / M" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">Harga (Rp) *</label>
                        <input value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} type="number" min="0"
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                          placeholder="250000" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-slate-500">Stok</label>
                        <input value={v.stock} onChange={e => handleVariantChange(i, 'stock', e.target.value)} type="number" min="0"
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-tan-500"
                          placeholder="50" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setVariants(vs => [...vs, { ...emptyVariant }])}
                  className="text-sm text-tan-600 hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Tambah Varian
                </button>
              </div>

              {/* Badges */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Label Produk</h4>
                <div className="flex flex-wrap gap-4">
                  {([['isFeatured', 'Unggulan'], ['isNew', 'Produk Baru'], ['isBestSeller', 'Best Seller']] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name={key} checked={(form as any)[key]}
                        onChange={handleChange} className="w-4 h-4 accent-tan-600" />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
