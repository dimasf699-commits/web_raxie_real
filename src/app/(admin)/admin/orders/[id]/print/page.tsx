'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Printer, Package, Truck, ArrowLeft, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function PrintShippingLabelPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrderDetail() {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    if (orderId) fetchOrderDetail()
  }, [orderId])

  useEffect(() => {
    if (order) {
      // Auto trigger print dialog after rendering
      const timer = setTimeout(() => {
        window.print()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [order])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-sm font-semibold">Memuat Label Resi Pengiriman...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
        <p className="text-rose-600 font-bold">Pesanan tidak ditemukan.</p>
      </div>
    )
  }

  const customerName = order.user?.name || order.guestName || order.shippingName || 'Pelanggan'
  const customerPhone = order.shippingPhone || order.user?.phone || order.guestPhone || '-'
  const waybill = order.shippingWaybill || order.trackingNumber || 'BELUM-ADA-RESI'
  const courier = order.courierName || 'REGULER'

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 text-slate-900 font-sans print:bg-white print:p-0">
      {/* Control Action Bar (Hidden when printing) */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Resi Sekarang (Ctrl+P)
        </button>
      </div>

      {/* Printable Label Box Card */}
      <div className="max-w-2xl mx-auto bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border-2 print:border-black print:rounded-none print:max-w-full">
        {/* Top Header Label */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b-2 border-slate-900 print:bg-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-serif font-black text-xl">
              R
            </div>
            <div>
              <h1 className="font-serif font-black text-lg text-amber-400 tracking-wide">RAXIE OFFICIAL</h1>
              <p className="text-[10px] text-slate-300">Premium Leather Wallets &amp; Accessories</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">NO. INVOICE</span>
            <span className="font-mono font-extrabold text-sm text-white">{order.orderNumber}</span>
          </div>
        </div>

        {/* Courier Waybill Resi Highlight Banner */}
        <div className="bg-amber-50 p-4 border-b-2 border-slate-900 flex items-center justify-between print:bg-slate-100">
          <div>
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">EKSPEDISI &amp; KURIR</span>
            <span className="text-base font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Truck className="w-5 h-5 text-amber-600" /> {courier.toUpperCase()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">NOMOR RESI / WAYBILL</span>
            <span className="font-mono font-black text-xl text-slate-900 tracking-wider bg-white border border-slate-900 px-3 py-1 rounded-lg inline-block mt-0.5">
              {waybill}
            </span>
          </div>
        </div>

        {/* Sender & Receiver Details */}
        <div className="grid grid-cols-2 divide-x-2 divide-slate-900 border-b-2 border-slate-900 text-xs">
          {/* Sender */}
          <div className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">PENGIRIM (SENDER):</span>
            <p className="font-extrabold text-sm text-slate-900">RAXIE Official Store</p>
            <p className="text-slate-700">No. HP: 0821-2886-2433</p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Kawasan Industri &amp; Pergudangan Raxie, DKI Jakarta, 10000, Indonesia
            </p>
          </div>

          {/* Receiver */}
          <div className="p-4 space-y-1 bg-amber-500/5 print:bg-slate-50">
            <span className="text-[10px] font-bold text-amber-800 dark:text-slate-500 uppercase tracking-wider block mb-1">PENERIMA (RECIPIENT):</span>
            <p className="font-black text-base text-slate-900">{customerName}</p>
            <p className="font-extrabold text-slate-900">No. WA / HP: {customerPhone}</p>
            <p className="text-slate-800 text-xs font-semibold leading-relaxed mt-1">
              {order.shippingStreet}, {order.shippingCity}, {order.shippingPostalCode}
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
            <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> DAFTAR BARANG DALAM PAKET ({order.items?.length || 0})</span>
            <span>QTY</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items?.map((item: any) => (
              <div key={item.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.productName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">SKU: {item.sku} {item.variantName ? `| ${item.variantName}` : ''}</p>
                </div>
                <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Payment & Shipping Note */}
        <div className="bg-slate-950 text-slate-300 p-4 border-t-2 border-slate-900 flex items-center justify-between text-xs print:bg-black print:text-white">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">STATUS PEMBAYARAN</span>
            <span className="font-extrabold text-amber-400 text-sm">
              LUNAS ({formatPrice(order.totalAmount)})
            </span>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400">Dicetak Otomatis oleh Sistem Raxie Admin</p>
            <p className="text-[9px] font-mono text-slate-500">{new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
