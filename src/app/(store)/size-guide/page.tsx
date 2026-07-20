import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Panduan Ukuran | Raxie',
  description: 'Panduan dimensi dan ukuran produk Raxie.',
}

export default function SizeGuidePage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Panduan Ukuran', href: '/size-guide' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert">
          <h1 className="font-serif font-bold text-4xl mb-8">Panduan Ukuran & Dimensi</h1>
          <p>
            Kami memastikan setiap produk didesain ergonomis agar pas di kantong atau tas Anda. Berikut adalah referensi standar ukuran yang biasa kami gunakan:
          </p>
          
          <h3>Bifold Wallet (Dompet Lipat Standar)</h3>
          <ul>
            <li>Panjang Tertutup: ~11 cm</li>
            <li>Tinggi: ~9 cm</li>
            <li>Ketebalan Kosong: ~1.5 cm</li>
          </ul>
          
          <h3>Slim Wallet & Card Holder</h3>
          <ul>
            <li>Panjang: ~10 cm</li>
            <li>Tinggi: ~7 cm</li>
            <li>Ketebalan Kosong: ~0.5 cm</li>
          </ul>

          <p><em>(Halaman ini adalah contoh tampilan sementara. Informasi di atas adalah ilustrasi dan Anda dapat menggantinya dengan spesifikasi asli).</em></p>
        </div>
      </div>
    </div>
  )
}
