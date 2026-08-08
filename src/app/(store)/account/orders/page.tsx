import { Package, ChevronRight, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Script from 'next/script'
import { Button } from '@/components/ui/Button'
import { formatPrice, cn } from '@/lib/utils'
import { PayNowButton } from '@/components/store/PayNowButton'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Pesanan Saya | Raxie',
}

import { ORDER_STATUS_MAP as statusMap, COURIER_TRACKING_LINKS as courierTrackingLinks } from '@/lib/constants'

const tabs = [
  { key: 'ALL', label: 'Semua Pesanan', href: '/account/orders' },
  { key: 'PENDING_PAYMENT', label: 'Belum Bayar', href: '/account/orders?status=PENDING_PAYMENT' },
  { key: 'PROCESSING', label: 'Diproses', href: '/account/orders?status=PROCESSING' },
  { key: 'SHIPPED', label: 'Dikirim', href: '/account/orders?status=SHIPPED' },
  { key: 'COMPLETED', label: 'Selesai', href: '/account/orders?status=COMPLETED' },
]

interface OrdersPageProps {
  searchParams?: {
    status?: string
    page?: string
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const activeStatus = searchParams?.status || 'ALL'
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10))
  const limit = 15

  // Build prisma filter clause
  let whereStatus: any = undefined
  if (activeStatus === 'PENDING_PAYMENT') {
    whereStatus = 'PENDING_PAYMENT'
  } else if (activeStatus === 'PROCESSING') {
    whereStatus = { in: ['PROCESSING', 'PAYMENT_CONFIRMED', 'PACKED'] }
  } else if (activeStatus === 'SHIPPED') {
    whereStatus = { in: ['SHIPPED', 'DELIVERED'] }
  } else if (activeStatus === 'COMPLETED') {
    whereStatus = 'COMPLETED'
  }

  const userEmail = session?.user?.email

  const whereClause = {
    OR: [
      { userId: session.user.id },
      ...(userEmail ? [{ guestEmail: userEmail }] : []),
    ],
    ...(whereStatus ? { status: whereStatus } : {})
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { items: true }
    }),
    prisma.order.count({ where: whereClause })
  ])

  const totalPages = Math.ceil(totalOrders / limit)

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  const snapScriptUrl = isProduction 
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''

  return (
    <div className="space-y-6">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="lazyOnload" />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground">Pesanan Saya</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.key
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-tan-500 text-white shadow-sm'
                  : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">Belum ada pesanan</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {activeStatus === 'ALL'
                ? 'Anda belum pernah melakukan pemesanan.'
                : 'Tidak ada pesanan di kategori ini.'}
            </p>
            <Link href="/products">
              <Button>Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          orders.map(order => {
            const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' }
            const firstItem = order.items[0]
            const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED'
            const trackingUrl = order.courierName ? courierTrackingLinks[order.courierName] : null
            
            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Tracking Info Banner */}
                {isShipped && (order.trackingNumber || order.shippingWaybill) && (
                  <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/40 rounded-xl px-4 py-3 mb-4">
                    <Truck className="w-5 h-5 text-purple-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold">Pesanan sedang dalam perjalanan</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {order.courierName} · Resi: <span className="font-mono font-bold">{order.shippingWaybill || order.trackingNumber}</span>
                      </p>
                    </div>
                    {trackingUrl && (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline whitespace-nowrap"
                      >
                        Lacak →
                      </a>
                    )}
                  </div>
                )}

                {firstItem && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border">
                        <Image src={firstItem.image} alt={firstItem.productName} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm line-clamp-1">{firstItem.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {firstItem.variantName ? `Warna/Ukuran: ${firstItem.variantName}` : '1 Item'}
                          {order.items.length > 1 && ` (+${order.items.length - 1} produk lainnya)`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Belanja</p>
                      <p className="font-bold text-foreground">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm">Detail &amp; Invoice</Button>
                  </Link>
                  
                  {order.status === 'PENDING_PAYMENT' && order.midtransToken && (
                    <PayNowButton snapToken={order.midtransToken} />
                  )}

                  {isShipped && (order.trackingNumber || order.shippingWaybill) ? (
                    <a href={trackingUrl || '#'} target={trackingUrl ? "_blank" : undefined} rel="noopener noreferrer">
                      <Button size="sm" className="gap-1">
                        <Truck className="w-4 h-4" />
                        Lacak Paket
                      </Button>
                    </a>
                  ) : order.status !== 'PENDING_PAYMENT' && (
                    <Button size="sm" variant="outline" className="gap-1 opacity-50 cursor-not-allowed" disabled>
                      Menunggu Pengiriman
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
