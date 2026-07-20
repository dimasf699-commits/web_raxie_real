'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, MapPin, Gift, Clock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'

export default function AccountDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/account/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Halo'

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Halo, {firstName}! 👋</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-tan-500 to-tan-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 text-white/80 mb-2 text-sm">
            <Gift className="w-4 h-4" /> Poin Raxie
          </div>
          <div className="text-3xl font-bold font-serif mb-1">{stats?.points ?? 0}</div>
          <div className="text-xs text-white/80">
            = {formatPrice((stats?.points ?? 0) * 10)} Cashback
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
            <Package className="w-4 h-4" /> Sedang Diproses
          </div>
          <div className="text-3xl font-bold font-serif text-foreground mb-1">
            {stats?.activeOrders ?? 0}
          </div>
          <Link href="/account/orders" className="text-xs text-tan-600 hover:underline">
            Lihat status pengiriman &rarr;
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
            <MapPin className="w-4 h-4" /> Total Pesanan
          </div>
          <div className="text-3xl font-bold font-serif text-foreground mb-1">
            {stats?.totalOrders ?? 0}
          </div>
          <div className="text-xs text-muted-foreground">Semua waktu</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-bold text-lg text-foreground mb-4">Pesanan Terakhir</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {stats?.recentOrders?.length > 0 ? (
            stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                <div className="w-12 h-12 bg-tan-50 text-tan-500 rounded-full flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{formatPrice(order.totalAmount)}</p>
                  <span className="text-xs text-muted-foreground">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada pesanan</p>
              <Link href="/products" className="text-sm text-tan-600 hover:underline mt-2 inline-block">
                Mulai belanja &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
