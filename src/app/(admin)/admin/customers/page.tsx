'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Users, Loader2, ShoppingBag } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      setCustomers(data.customers || [])
      setTotal(data.total || 0)
    } catch {
      // silent error
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(t)
  }, [fetchCustomers])

  const roleColor: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700',
    STAFF: 'bg-blue-100 text-blue-700',
    CUSTOMER: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Data Pelanggan</h1>
        <p className="text-sm text-slate-500 mt-1">Total <strong>{total}</strong> pengguna terdaftar</p>
      </div>

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama / email..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-lg focus:outline-none focus:border-tan-400 focus:ring-1 focus:ring-tan-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-tan-500" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Belum ada pelanggan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-muted/50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pelanggan</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Total Pesanan</th>
                  <th className="px-6 py-4 font-semibold">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-tan-100 text-tan-700 flex items-center justify-center font-bold text-sm">
                            {c.name?.[0] ?? '?'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-foreground">{c.name ?? '-'}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${roleColor[c.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">{c._count?.orders ?? 0}</span>
                        <span className="text-slate-400 text-xs">pesanan</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
