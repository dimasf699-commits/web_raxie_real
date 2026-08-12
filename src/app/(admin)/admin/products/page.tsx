'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Plus, Search, Edit, Trash, Loader2, RefreshCw, PackageOpen, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/Toaster'
import { ProductFormModal } from '@/components/admin/ProductFormModal'

type Product = {
  id: string
  name: string
  slug: string
  basePrice: number
  isActive: boolean
  category: { name: string }
  images: { url: string }[]
  variants: { stock: number; sku: string }[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Bulk Edit State
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<string>('keep')
  const [bulkCategory, setBulkCategory] = useState<string>('keep')
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'File berhasil diunggah')
        fetchProducts()
      } else {
        toast.error(data.message || 'Gagal mengunggah file')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengunggah file')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/products?page=${page}&search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (e) {
      toast.error('Gagal memuat produk')
    } finally {
      setIsLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Produk berhasil dihapus')
        fetchProducts()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Gagal menghapus produk')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan koneksi')
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} produk terpilih? Tindakan ini tidak bisa dibatalkan.`)) return
    setIsBulkDeleting(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (res.ok) {
        toast.success('Produk berhasil dihapus')
        setSelectedIds([])
        fetchProducts()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || 'Gagal menghapus produk')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openBulkEdit = async () => {
    setBulkStatus('keep')
    setBulkCategory('keep')
    setShowBulkEditModal(true)
    if (categories.length === 0) {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(data)
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleBulkEditSubmit = async () => {
    if (bulkStatus === 'keep' && bulkCategory === 'keep') {
      toast.error('Pilih setidaknya satu opsi untuk diubah')
      return
    }

    setIsBulkEditing(true)
    try {
      const dataToUpdate: any = {}
      if (bulkStatus !== 'keep') dataToUpdate.isActive = bulkStatus === 'active'
      if (bulkCategory !== 'keep') dataToUpdate.categoryId = bulkCategory

      const res = await fetch('/api/admin/products/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: dataToUpdate }),
      })

      if (res.ok) {
        toast.success('Produk berhasil diperbarui')
        setSelectedIds([])
        setShowBulkEditModal(false)
        fetchProducts()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.message || 'Gagal memperbarui produk')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsBulkEditing(false)
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Daftar Produk</h1>
          <p className="text-sm text-slate-500 mt-1">
            Total <strong>{total}</strong> produk di database
          </p>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
          <Button variant="outline" className="gap-2 shrink-0 border-slate-200" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import Shopee
          </Button>
          <Button variant="outline" className="gap-2 border-slate-200" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="gap-2 shrink-0" onClick={() => { setEditProduct(null); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Tambah Produk
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
            <span className="text-sm font-medium text-red-800 dark:text-red-400">
              {selectedIds.length} produk terpilih
            </span>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={openBulkEdit} disabled={isBulkDeleting}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Terpilih
              </Button>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100" onClick={() => setSelectedIds([])} disabled={isBulkDeleting}>Batal</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash className="w-4 h-4 mr-2" />}
                Hapus Terpilih
              </Button>
            </div>
          </div>
        )}

        {/* Search Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-tan-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada produk</p>
            <p className="text-slate-400 text-sm mt-1">Klik tombol "Tambah Produk" untuk mulai menambahkan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-tan-600 focus:ring-tan-500 w-4 h-4"
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold">Info Produk</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Harga</th>
                  <th className="px-6 py-4 font-semibold">Stok</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {products.map((product) => {
                  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-tan-600 focus:ring-tan-500 w-4 h-4"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectOne(product.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div 
                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => product.images[0] && setPreviewImage(product.images[0].url)}
                          >
                            {product.images[0] ? (
                              <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{product.variants[0]?.sku || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{product.category.name}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-foreground">
                        {formatPrice(product.basePrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          totalStock > 10 ? 'bg-green-100 text-green-700' :
                          totalStock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {totalStock} Tersisa
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditProduct(product); setShowForm(true) }}
                            className="p-2 text-slate-400 hover:text-tan-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-border flex items-center justify-between text-sm text-slate-500">
            <p>Menampilkan {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} dari {total} produk</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >Sebel.</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 border rounded font-medium ${p === page ? 'border-tan-400 bg-tan-50 text-tan-700' : 'border-slate-200 hover:bg-slate-50'}`}
                >{p}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >Lanjut</button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        product={editProduct}
        onClose={() => { setShowForm(false); setEditProduct(null) }}
        onSuccess={() => { setShowForm(false); setEditProduct(null); fetchProducts() }}
      />

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-foreground">Edit {selectedIds.length} Produk</h3>
              <button onClick={() => setShowBulkEditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status Produk</label>
                <select 
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400"
                >
                  <option value="keep">- Biarkan Tidak Berubah -</option>
                  <option value="active">Aktifkan (Tampilkan)</option>
                  <option value="inactive">Nonaktifkan (Sembunyikan)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Baru</label>
                <select 
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg text-sm focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400"
                >
                  <option value="keep">- Biarkan Tidak Berubah -</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-border bg-slate-50 dark:bg-muted/50 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkEditModal(false)} disabled={isBulkEditing}>Batal</Button>
              <Button onClick={handleBulkEditSubmit} disabled={isBulkEditing} className="bg-tan-600 hover:bg-tan-700 text-white border-0">
                {isBulkEditing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-all"
              onClick={() => setPreviewImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}
    </div>
  )
}
