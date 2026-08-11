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
    <div className="space-y-8 text-black dark:text-white transition-colors duration-300">
      <div>
        <span className="text-[#C19A6B] text-[11px] font-extrabold tracking-[0.2em] uppercase block mb-1">
          RAXIE MEMBER DASHBOARD
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-black dark:text-white">
          HALO, {firstName.toUpperCase()}! 👋
        </h1>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Poin */}
        <div className="bg-[#C19A6B] rounded-sm p-6 text-black shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-black/80 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4" /> Poin RAXIE
          </div>
          <div className="text-4xl font-bold font-serif">{stats?.points ?? 0}</div>
          <div className="text-[11px] text-black/80 font-medium">
            = {formatPrice((stats?.points ?? 0) * 10)} Cashback
          </div>
        </div>

        {/* Card 2: Sedang Diproses */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <Package className="w-4 h-4 text-[#C19A6B]" /> Sedang Diproses
          </div>
          <div className="text-4xl font-bold font-serif text-black dark:text-white">
            {stats?.activeOrders ?? 0}
          </div>
          <Link href="/account/orders" className="text-[11px] text-[#C19A6B] font-bold uppercase tracking-wider hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5">
            Lihat status pengiriman <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Total Pesanan */}
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#C19A6B]" /> Total Pesanan
          </div>
          <div className="text-4xl font-bold font-serif text-black dark:text-white">
            {stats?.totalOrders ?? 0}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">Semua riwayat transaksi</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-5 pt-4">
        <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-[#C19A6B]">PESANAN TERAKHIR</h2>
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden shadow-sm">
          {stats?.recentOrders?.length > 0 ? (
            stats.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-white dark:hover:bg-[#151515] transition-colors border-b border-neutral-200 dark:border-neutral-800 last:border-0 text-xs">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 text-[#C19A6B] rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-black dark:text-white uppercase tracking-wider">{order.orderNumber}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#C19A6B]">{formatPrice(order.totalAmount)}</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400">{order.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center space-y-3">
              <Clock className="w-10 h-10 text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Belum ada riwayat pesanan</p>
              <Link href="/products" className="text-[11px] text-[#C19A6B] hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider font-bold inline-block pt-2">
                MULAI BELANJA &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
