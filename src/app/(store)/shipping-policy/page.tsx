import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Kebijakan Pengiriman | Raxie',
  description: 'Informasi pengiriman dan tarif ongkos kirim Raxie.',
}

export default function ShippingPolicyPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Kebijakan Pengiriman', href: '/shipping-policy' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert">
          <h1 className="font-serif font-bold text-4xl mb-8">Kebijakan Pengiriman</h1>
          <p>Kami berkomitmen untuk mengirimkan pesanan Anda secepat dan seaman mungkin.</p>
          
          <h3>Waktu Proses Pesanan</h3>
          <p>Semua pesanan yang masuk dan telah dibayar sebelum pukul 15:00 WIB akan diproses pada hari yang sama. Pesanan yang masuk setelah waktu tersebut atau pada hari libur akan diproses pada hari kerja berikutnya.</p>
          
          <h3>Opsi Kurir</h3>
          <p>Kami bekerja sama dengan berbagai layanan pengiriman terpercaya (JNE, SiCepat, J&T) untuk memastikan paket Anda tiba dengan selamat. Tarif dan estimasi waktu sampai bergantung pada kurir dan paket yang Anda pilih saat checkout.</p>
          
          <p><em>(Halaman ini adalah contoh tampilan sementara. Anda dapat memperbarui kebijakan pengiriman sesuai SOP toko Anda).</em></p>
        </div>
      </div>
    </div>
  )
}
