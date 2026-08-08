import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Admin Dashboard | Raxie',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [totalOrders, totalRevenueObj, totalCustomers, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { notIn: ['CANCELLED', 'RETURNED', 'REFUNDED'] } }
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true }
    })
  ])

  const totalRevenue = totalRevenueObj._sum.totalAmount || 0

  const STATS = [
    { label: 'Total Pendapatan', value: formatPrice(totalRevenue), badge: 'Realtime', icon: DollarSign },
    { label: 'Total Pesanan', value: totalOrders.toString(), badge: 'Total Order', icon: ShoppingBag },
    { label: 'Total Pelanggan', value: totalCustomers.toString(), badge: 'Terdaftar', icon: Users },
    { label: 'Status Toko', value: 'Aktif', badge: 'Production', icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-tan-50 text-tan-600 flex items-center justify-center">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {stat.badge}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-foreground mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
          <h3 className="font-bold text-slate-800 dark:text-foreground mb-4">Grafik Penjualan (Akan Datang)</h3>
          <div className="w-full h-[300px] bg-slate-50 dark:bg-muted/50 rounded-xl flex items-center justify-center border border-dashed border-slate-300 dark:border-border">
            <p className="text-slate-400">Area Chart Analytics akan dirender di sini</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-foreground mb-4">Pesanan Terbaru</h3>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada pesanan.</p>
            ) : (
              recentOrders.map((order) => {
                const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0)
                const name = order.shippingName || order.user?.name || 'Guest'
                
                return (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-border last:border-0">
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-foreground truncate">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500 truncate">{name} • {totalItems} item</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-foreground">{formatPrice(order.totalAmount)}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {order.status === 'PENDING_PAYMENT' ? 'Belum Bayar' : 'Diproses'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
