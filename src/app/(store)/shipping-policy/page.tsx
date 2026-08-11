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
        
        <div className="mt-8 max-w-3xl space-y-6">
          <h1 className="font-serif font-extrabold text-3xl md:text-4xl mb-4 uppercase tracking-tight text-black dark:text-white">Kebijakan Pengiriman</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs md:text-sm leading-relaxed">
            Kami berkomitmen untuk mengirimkan pesanan Anda secepat dan seaman mungkin.
          </p>
          
          <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">Waktu Proses Pesanan</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">Semua pesanan yang masuk dan telah dibayar sebelum pukul 15:00 WIB akan diproses pada hari yang sama. Pesanan yang masuk setelah waktu tersebut atau pada hari libur akan diproses pada hari kerja berikutnya.</p>
            
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white pt-4">Opsi Kurir</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">Kami bekerja sama dengan berbagai layanan pengiriman terpercaya (JNE, SiCepat, J&T) untuk memastikan paket Anda tiba dengan selamat. Tarif dan estimasi waktu sampai bergantung pada kurir dan paket yang Anda pilih saat checkout.</p>
            
            <p className="text-neutral-400 dark:text-neutral-500 text-[10px] italic pt-4">*(Halaman ini adalah contoh tampilan sementara. Anda dapat memperbarui kebijakan pengiriman sesuai SOP toko Anda).*</p>
          </div>
        </div>
      </div>
    </div>
  )
}
