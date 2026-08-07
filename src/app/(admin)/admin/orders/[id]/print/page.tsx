'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Printer, ArrowLeft, Loader2 } from 'lucide-react'

export default function OrderPrintPage() {
  const params = useParams()
  const orderId = params?.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/admin/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data.order || data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500 font-medium">Pesanan tidak ditemukan</p>
      </div>
    )
  }

  const customerName = order.user?.name ?? order.guestName ?? order.shippingName ?? 'Pelanggan'
  const customerPhone = order.shippingPhone ?? order.user?.phone ?? '-'
  const waybill = order.shippingWaybill || order.trackingNumber || '-'

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white print:m-0 print:w-full">
      <style>{`
        @page {
          size: 100mm 150mm;
          margin: 0;
        }
        @media print {
          aside, nav, header, footer, [class*="sidebar"], [class*="Sidebar"] {
            display: none !important;
          }
          body, main {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100mm !important;
          }
          .printable-card {
            width: 100mm !important;
            max-width: 100mm !important;
            box-sizing: border-box !important;
            border: 2px solid #000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 8mm !important;
          }
        }
      `}</style>

      {/* Control Bar (Hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Resi / Label
        </button>
      </div>

      {/* Printable Label & Invoice Card */}
      <div className="printable-card max-w-3xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-lg print:shadow-none print:border-2 print:border-black print:rounded-none p-6 sm:p-8 text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">RAXIE.</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Premium Synthetic Leather Goods</p>
            <p className="text-xs text-slate-500 mt-0.5">Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat</p>
            <p className="text-xs text-slate-500">WA: 0821-2886-2433 | Email: raxieleather@gmail.com</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-slate-900 text-white text-xs font-mono font-bold px-3 py-1 rounded">
              LABEL PENGIRIMAN
            </span>
            <p className="text-sm font-mono font-bold text-slate-900 mt-2">#{order.orderNumber}</p>
            <p className="text-xs text-slate-500">
              {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Resi & Courier Badge */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-400 p-4 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">KURIR & EXPEDISI</p>
            <p className="text-lg font-extrabold text-slate-900 uppercase">{order.courierName || 'JNE REG'}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">NOMOR RESI / WAYBILL</p>
            <p className="text-xl font-mono font-black text-slate-900 tracking-wider bg-yellow-100 px-3 py-1 rounded-lg border border-yellow-300 mt-0.5">
              {waybill}
            </p>
          </div>
        </div>

        {/* Shipping Address Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Sender */}
          <div className="border border-slate-200 p-4 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PENGIRIM</p>
            <p className="font-bold text-slate-900">RAXIE OFFICIAL STORE</p>
            <p className="text-xs text-slate-600 mt-1">0821-2886-2433</p>
            <p className="text-xs text-slate-600 mt-1">Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat (44161)</p>
          </div>

          {/* Recipient */}
          <div className="border-2 border-slate-900 p-4 rounded-xl bg-slate-50/50">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">PENERIMA (TUJUAN)</p>
            <p className="font-bold text-slate-900 text-base">{customerName}</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">📱 {customerPhone}</p>
            <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">{order.shippingStreet}</p>
            <p className="text-xs text-slate-500 mt-1">Kode Pos: {order.shippingPostalCode || '-'}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Item Produk</th>
                <th className="p-3 text-center">Jumlah</th>
                <th className="p-3 text-right">Harga</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="p-3 font-semibold text-slate-800">
                    {item.productName}
                    {item.variantName && <span className="text-slate-500 font-normal block text-[11px]">Varian: {item.variantName}</span>}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-700">{item.quantity}x</td>
                  <td className="p-3 text-right text-slate-600">Rp {item.price.toLocaleString('id-ID')}</td>
                  <td className="p-3 text-right font-semibold text-slate-800">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="flex justify-between items-end border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">
            <p>Status Pembayaran: <strong className="text-emerald-700 uppercase">LUNAS / DIBAYAR</strong></p>
            <p className="mt-0.5">Metode Bayar: {order.paymentMethod || 'Midtrans'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Tagihan Pesanan</p>
            <p className="text-xl font-bold text-slate-900">Rp {order.totalAmount?.toLocaleString('id-ID')}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
