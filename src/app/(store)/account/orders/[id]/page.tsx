import { Package, ArrowLeft, Printer, Truck, MapPin, CreditCard, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import Script from 'next/script'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { PayNowButton } from '@/components/store/PayNowButton'
import { PrintInvoiceButton } from '@/components/store/PrintInvoiceButton'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Detail Pesanan | Raxie',
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: 'Belum Bayar', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PAYMENT_CONFIRMED: { label: 'Dibayar', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  PROCESSING: { label: 'Diproses', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  PACKED: { label: 'Dikemas', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  SHIPPED: { label: 'Dikirim', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  DELIVERED: { label: 'Terkirim', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

interface OrderDetailPageProps {
  params: { id: string }
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      trackingHistory: { orderBy: { timestamp: 'desc' } },
    },
  })

  const userEmail = session.user.email
  const isOwner = order && (order.userId === session.user.id || (userEmail && order.guestEmail === userEmail))

  if (!order || !isOwner) {
    notFound()
  }

  const status = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' }
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  const snapScriptUrl = isProduction 
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''

  return (
    <div className="space-y-6 max-w-4xl mx-auto print:max-w-none print:p-0">
      <Script src={snapScriptUrl} data-client-key={clientKey} strategy="lazyOnload" />

      {/* Header Bar - Hidden during printing */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/account/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan Saya
        </Link>
        <PrintInvoiceButton />
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-2xl tracking-tight text-foreground print:text-black">RAXIE</span>
              <span className="text-xs bg-tan-100 text-tan-700 px-2 py-0.5 rounded font-medium print:hidden">INVOICE</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 print:text-gray-600">Garut, Jawa Barat · raxieleather@gmail.com · 0821-2886-2433</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground print:text-gray-600">Nomor Invoice</p>
            <p className="font-mono font-bold text-lg text-foreground print:text-black">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground mt-0.5 print:text-gray-600">
              {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Badge & Resi Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/40 rounded-xl print:bg-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground print:text-gray-700">Status Pesanan:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
              {status.label}
            </span>
          </div>

          {(order.shippingWaybill || order.trackingNumber) && (
            <div className="flex items-center gap-2 text-xs font-mono text-foreground print:text-black">
              <Truck className="w-4 h-4 text-tan-500 shrink-0" />
              <span>Resi {order.courierName || 'Kurir'}: <strong>{order.shippingWaybill || order.trackingNumber}</strong></span>
            </div>
          )}
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 print:text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-tan-500" /> Alamat Pengiriman
            </h3>
            <div className="p-4 bg-background dark:bg-card border border-border rounded-xl text-sm space-y-1 print:border-gray-300">
              <p className="font-bold text-foreground print:text-black">{order.shippingName}</p>
              <p className="text-muted-foreground text-xs print:text-gray-600">{order.shippingPhone}</p>
              <p className="text-foreground/80 mt-2 print:text-black">{order.shippingStreet}</p>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                {[order.shippingCity, order.shippingProvince, order.shippingPostalCode].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 print:text-gray-700">
              <CreditCard className="w-3.5 h-3.5 text-tan-500" /> Metode Pembayaran
            </h3>
            <div className="p-4 bg-background dark:bg-card border border-border rounded-xl text-sm space-y-2 print:border-gray-300">
              <p className="font-bold text-foreground print:text-black">{order.paymentMethod || 'Transfer Bank / Online'}</p>
              <p className="text-xs text-muted-foreground print:text-gray-600">
                Kurir: <strong>{order.courierName || 'Pengiriman Standar'}</strong>
              </p>
              <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium print:text-gray-700">
                <ShieldCheck className="w-4 h-4" /> Garansi Produk Raxie 30 Hari
              </div>
            </div>
          </div>
        </div>

        {/* Item Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-gray-700">Detail Produk</h3>
          <div className="border border-border rounded-xl overflow-hidden print:border-gray-300">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produk</th>
                  <th className="px-4 py-3 font-semibold text-center">Harga</th>
                  <th className="px-4 py-3 font-semibold text-center">Jumlah</th>
                  <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border print:hidden">
                          <Image src={item.image || '/placeholder.jpg'} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm print:text-black">{item.productName}</p>
                          {item.variantName && <p className="text-xs text-muted-foreground print:text-gray-600">{item.variantName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground print:text-black">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-center font-medium print:text-black">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground print:text-black">{formatPrice(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 space-y-2 text-sm border-t border-border pt-4 print:border-gray-300">
            <div className="flex justify-between text-muted-foreground print:text-gray-700">
              <span>Subtotal Produk</span>
              <span className="font-medium text-foreground print:text-black">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground print:text-gray-700">
              <span>Ongkos Kirim</span>
              <span className="font-medium text-foreground print:text-black">{formatPrice(order.shippingCost)}</span>
            </div>
            {order.totalAmount < order.subtotal + order.shippingCost && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Potongan Diskon</span>
                <span>-{formatPrice((order.subtotal + order.shippingCost) - order.totalAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-end border-t border-border pt-3 text-base font-bold text-foreground print:text-black">
              <span>Total Pembayaran</span>
              <span className="text-xl text-tan-600 dark:text-tan-400 print:text-black">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Pay Now Button if Pending Payment */}
        {order.status === 'PENDING_PAYMENT' && order.midtransToken && (
          <div className="pt-4 border-t border-border flex justify-end print:hidden">
            <PayNowButton snapToken={order.midtransToken} />
          </div>
        )}
      </div>
    </div>
  )
}
