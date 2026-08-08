'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, MapPin, Gift, Clock, ArrowRight } from 'lucide-react'
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

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Pelanggan'

  return (
    <div className="space-y-8 text-foreground transition-colors duration-300">
      <div>
        <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1">
          RAXIE MEMBER DASHBOARD
        </span>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-foreground">
          HALO, {firstName.toUpperCase()}! 👋
        </h1>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Poin */}
        <div className="bg-[#C19A6B] rounded-xl p-6 text-black shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-black/80 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4" /> Poin RAXIE
          </div>
          <div className="text-4xl font-bold font-serif">{stats?.points ?? 0}</div>
          <div className="text-[11px] text-black/80 font-medium">
            = {formatPrice((stats?.points ?? 0) * 10)} Cashback
          </div>
        </div>

        {/* Card 2: Sedang Diproses */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <Package className="w-4 h-4 text-[#C19A6B]" /> Sedang Diproses
          </div>
          <div className="text-4xl font-bold font-serif text-foreground">
            {stats?.activeOrders ?? 0}
          </div>
          <Link href="/account/orders" className="text-[11px] text-[#C19A6B] hover:underline inline-flex items-center gap-1">
            Lihat status pengiriman <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Total Pesanan */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#C19A6B]" /> Total Pesanan
          </div>
          <div className="text-4xl font-bold font-serif text-foreground">
            {stats?.totalOrders ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground">Semua riwayat transaksi</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4 pt-4">
        <h2 className="font-serif font-bold text-base uppercase tracking-wider text-[#C19A6B]">PESANAN TERAKHIR</h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {stats?.recentOrders?.length > 0 ? (
            stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border last:border-0 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted border border-border text-[#C19A6B] rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground uppercase">{order.orderNumber}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#C19A6B]">{formatPrice(order.totalAmount)}</p>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">Belum ada riwayat pesanan</p>
              <Link href="/products" className="text-xs text-[#C19A6B] hover:underline font-bold inline-block pt-1">
                Mulai Belanja &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
