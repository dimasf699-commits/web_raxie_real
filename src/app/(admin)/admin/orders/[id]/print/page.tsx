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
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order || data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <p className="font-medium">Pesanan tidak ditemukan</p>
      </div>
    )
  }

  const customerName = order.user?.name ?? order.guestName ?? order.shippingName ?? 'Pelanggan'
  const customerPhone = order.shippingPhone ?? order.user?.phone ?? '-'
  const waybill = order.shippingWaybill || order.trackingNumber || '-'

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-8 print:p-0 print:bg-white print:min-h-0">
      <style>{`
        @page {
          size: 100mm 150mm;
          margin: 0mm;
        }
        @media print {
          html, body {
            width: 100mm !important;
            height: 150mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, nav, header, footer, [class*="sidebar"], [class*="Sidebar"], .no-print {
            display: none !important;
          }
          .thermal-label {
            width: 95mm !important;
            max-width: 95mm !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 3mm !important;
            border: 2px solid #000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }
        }
      `}</style>

      {/* Control Bar (Hidden when printing) */}
      <div className="no-print max-w-xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Resi / Stiker Thermal
        </button>
      </div>

      {/* Printable Thermal Label 95mm centered on 100mm paper */}
      <div className="thermal-label max-w-[95mm] mx-auto bg-white text-black font-sans border-2 border-black p-3 rounded-xl shadow-2xl box-border leading-tight overflow-hidden">
        
        {/* Header Logo & Courier */}
        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
          <div>
            <h1 className="text-xl font-black tracking-tighter">RAXIE.</h1>
            <p className="text-[9px] font-bold text-slate-700">OFFICIAL STORE</p>
          </div>
          <div className="bg-black text-white px-2.5 py-1 rounded text-center">
            <span className="text-xs font-black uppercase tracking-wider block">
              {order.courierName || 'JNE REG'}
            </span>
            <span className="text-[8px] font-bold tracking-widest text-slate-300 uppercase block">NON-COD</span>
          </div>
        </div>

        {/* Resi Barcode Box */}
        <div className="border-2 border-black p-2 text-center rounded-md mb-2 bg-slate-50">
          <p className="text-[9px] font-bold tracking-wider text-slate-600 uppercase">NOMOR RESI / WAYBILL</p>
          <p className="text-base font-mono font-black tracking-widest my-0.5 break-all">{waybill}</p>
          <p className="text-[9.5px] font-mono text-slate-800">Invoice: #{order.orderNumber}</p>
        </div>

        {/* Address Grid */}
        <div className="border-b-2 border-black pb-2 mb-2 space-y-2">
          {/* Recipient */}
          <div className="bg-slate-100 p-2 rounded border border-black">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-700">PENERIMA:</p>
            <p className="text-xs font-black text-black">{customerName}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">📞 {customerPhone}</p>
            <p className="text-[9.5px] font-semibold text-slate-800 mt-1 leading-snug">
              {order.shippingStreet}
            </p>
            <p className="text-[9px] font-bold text-slate-700 mt-0.5">
              Kode Pos: {order.shippingPostalCode || '-'}
            </p>
          </div>

          {/* Sender */}
          <div className="text-[8.5px] text-slate-800 px-1">
            <p className="font-bold">PENGIRIM: <span className="font-black text-black">RAXIE STORE (0821-2886-2433)</span></p>
            <p className="text-[8px] text-slate-600">Kp. Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat</p>
          </div>
        </div>

        {/* Item List */}
        <div className="border-b-2 border-black pb-2 mb-2">
          <p className="text-[9px] font-black uppercase tracking-wider mb-1">ISI PAKET / RINCIAN BARANG:</p>
          <div className="space-y-1">
            {order.items?.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex justify-between items-start text-[9px] border-b border-dashed border-slate-300 pb-1">
                <span className="font-bold pr-2 leading-tight truncate max-w-[75%]">
                  {item.productName}
                  {item.variantName && <span className="font-normal text-slate-600 block text-[8px]">Varian: {item.variantName}</span>}
                </span>
                <span className="font-black whitespace-nowrap">{item.quantity} pcs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-700 pt-1">
          <span>Tgl: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="font-black text-black">LUNAS ({order.paymentMethod?.replace('_', ' ') || 'ONLINE'})</span>
        </div>

      </div>
    </div>
  )
}
