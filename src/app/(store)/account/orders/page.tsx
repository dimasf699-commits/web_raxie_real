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
        <h1 className="font-serif text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-black dark:text-white">Pesanan Saya</h1>
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
                'px-4 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-[#121212] dark:bg-white text-white dark:text-black shadow-sm'
                  : 'border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
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
          <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">Belum ada pesanan</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-6 font-medium">
              {activeStatus === 'ALL'
                ? 'Anda belum pernah melakukan pemesanan.'
                : 'Tidak ada pesanan di kategori ini.'}
            </p>
            <Link href="/products">
              <Button className="bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider px-6 py-4 rounded-sm transition-colors">MULAI BELANJA</Button>
            </Link>
          </div>
        ) : (
          orders.map(order => {
            const status = statusMap[order.status] || { label: order.status, color: 'bg-neutral-100 text-neutral-700' }
            const firstItem = order.items[0]
            const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED'
            const trackingUrl = order.courierName ? courierTrackingLinks[order.courierName] : null
            
            return (
              <div key={order.id} className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">{order.orderNumber}</p>
                      <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider ${status.color}`}>
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
                      <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <Image src={firstItem.image} alt={firstItem.productName} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-black dark:text-white text-xs uppercase tracking-wider line-clamp-1">{firstItem.productName}</p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                          {firstItem.variantName ? `Warna/Ukuran: ${firstItem.variantName}` : '1 Item'}
                          {order.items.length > 1 && ` (+${order.items.length - 1} produk lainnya)`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Total Belanja</p>
                      <p className="font-bold text-sm text-[#C19A6B]">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm">Detail &amp; Invoice</Button>
                  </Link>
                  
                  {order.status === 'PENDING_PAYMENT' && order.midtransToken && (
                    <PayNowButton 
                      snapToken={order.midtransToken} 
                      orderId={order.orderNumber}
                      totalAmount={order.totalAmount}
                      items={order.items}
                    />
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
