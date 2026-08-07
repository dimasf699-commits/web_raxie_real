'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Download, Truck, Loader2, Package, Printer, Trash2, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { TrackingModal } from '@/components/admin/TrackingModal'
import { toast } from '@/components/ui/Toaster'

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT:   { label: 'Menunggu Bayar', color: 'bg-yellow-100 text-yellow-700' },
  PAYMENT_CONFIRMED: { label: 'Bayar Terkonfirmasi', color: 'bg-blue-100 text-blue-700' },
  PROCESSING:        { label: 'Diproses', color: 'bg-indigo-100 text-indigo-700' },
  PACKED:            { label: 'Dikemas', color: 'bg-purple-100 text-purple-700' },
  SHIPPED:           { label: 'Dikirim', color: 'bg-cyan-100 text-cyan-700' },
  DELIVERED:         { label: 'Terkirim', color: 'bg-teal-100 text-teal-700' },
  COMPLETED:         { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  CANCELLED:         { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
  RETURN_REQUESTED:  { label: 'Return Diminta', color: 'bg-orange-100 text-orange-700' },
  REFUNDED:          { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-700' },
}

const tabs = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Baru', value: 'PENDING_PAYMENT' },
  { label: 'Diproses', value: 'PROCESSING' },
  { label: 'Dikirim', value: 'SHIPPED' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [trackingOrder, setTrackingOrder] = useState<any>(null)

  // Checkbox Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeletingBulk, setIsDeletingBulk] = useState(false)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ status: activeTab, search })
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Gagal memuat pesanan')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length && orders.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(orders.map((o) => o.id))
    }
  }

  const toggleSelectOrder = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS ${selectedIds.length} PESANAN TERPILIH sekaligus?`)) {
      return
    }

    setIsDeletingBulk(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Pesanan terpilih berhasil dihapus!')
        setSelectedIds([])
        fetchOrders()
      } else {
        toast.error(data.error || 'Gagal menghapus pesanan terpilih')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setIsDeletingBulk(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success('Status pesanan berhasil diperbarui')
        fetchOrders()
      } else {
        toast.error('Gagal memperbarui status')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleCallBiteship = async (id: string, orderNumber: string) => {
    try {
      toast.info(`Memanggil kurir Biteship untuk ${orderNumber}...`)
      const res = await fetch(`/api/admin/orders/${id}/biteship`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Resi Biteship Berhasil Dibuat: ${data.waybill}`)
        fetchOrders()
      } else {
        toast.error(data.error || 'Gagal memanggil Biteship')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi ke Biteship')
    }
  }

  const handleDelete = async (id: string, orderNumber: string) => {
    if (!confirm(`Hapus pesanan ${orderNumber}? Tindakan ini tidak bisa dibatalkan.`)) return
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Pesanan berhasil dihapus')
        fetchOrders()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Gagal menghapus pesanan')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Daftar Pesanan</h1>
          <p className="text-sm text-slate-500 mt-1">Total <strong>{total}</strong> pesanan ditemukan</p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0 border-slate-200 text-xs font-semibold">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xl animate-in fade-in border border-slate-800">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg font-extrabold">{selectedIds.length}</span>
            <span>Pesanan Terpilih</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Batal Pilih
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
            >
              {isDeletingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus ({selectedIds.length}) Pesanan
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setSearch(''); setSelectedIds([]) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari Invoice / Nama..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-tan-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada pesanan</p>
            <p className="text-slate-400 text-sm mt-1">Pesanan dari pelanggan akan muncul di sini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="w-12 px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-amber-500 cursor-pointer"
                      title="Pilih Semua Pesanan"
                    />
                  </th>
                  <th className="px-4 py-4 font-semibold">ID Pesanan</th>
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Resi</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {orders.map((order) => {
                  const isChecked = selectedIds.includes(order.id)
                  const statusInfo = statusMap[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700' }
                  const customerName = order.user?.name ?? order.guestName ?? 'Tamu'
                  const customerEmail = order.user?.email ?? order.guestEmail ?? '-'
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${isChecked ? 'bg-amber-500/10 dark:bg-amber-500/20' : 'hover:bg-slate-50/50 dark:hover:bg-muted/30'}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800 dark:text-foreground">{order.orderNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700 dark:text-foreground">{customerName}</p>
                        <p className="text-xs text-slate-400">{customerEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 dark:text-foreground">{formatPrice(order.totalAmount)}</p>
                        <p className="text-[10px] text-slate-400">{order.paymentMethod ?? '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.shippingWaybill ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg w-fit">{order.shippingWaybill}</span>
                            <span className="text-[10px] text-slate-500">{order.courierName}</span>
                          </div>
                        ) : order.trackingNumber ? (
                          <span className="text-xs font-mono text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg">{order.trackingNumber}</span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="text-xs border border-slate-200 dark:border-border rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-muted font-medium focus:outline-none cursor-pointer"
                          >
                            {Object.entries(statusMap).map(([val, { label }]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>

                          {order.shippingWaybill ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTrackingOrder(order)}
                              className="text-xs text-cyan-700 border-cyan-300 hover:bg-cyan-50 gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" /> Lacak
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCallBiteship(order.id, order.orderNumber)}
                              className="text-xs text-indigo-700 border-indigo-300 hover:bg-indigo-50 gap-1.5"
                            >
                              <Truck className="w-3.5 h-3.5" /> Pickup
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(order.id, order.orderNumber)}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Hapus Pesanan"
                          >
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Lacak Resi */}
      {trackingOrder && (
        <TrackingModal
          orderId={trackingOrder.id}
          orderNumber={trackingOrder.orderNumber}
          waybill={trackingOrder.shippingWaybill}
          courier={trackingOrder.courierName || 'jne'}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </div>
  )
}
