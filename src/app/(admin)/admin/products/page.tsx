'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Search, Edit, Trash, Loader2, RefreshCw, PackageOpen } from 'lucide-react'
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
  }, [page, search, toast])

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
          <Button variant="outline" className="gap-2 border-slate-200" onClick={fetchProducts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="gap-2 shrink-0" onClick={() => { setEditProduct(null); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Tambah Produk
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
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
    </div>
  )
}
