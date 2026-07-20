import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Raxie',
  description: 'Bagaimana kami melindungi dan mengelola data privasi pelanggan.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Kebijakan Privasi', href: '/privacy-policy' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert">
          <h1 className="font-serif font-bold text-4xl mb-8">Kebijakan Privasi</h1>
          <p>
            Raxie ("kami") menghormati privasi Anda dan berkomitmen untuk melindunginya melalui kepatuhan kami terhadap kebijakan ini.
          </p>
          
          <h3>Data Apa yang Kami Kumpulkan</h3>
          <p>Saat Anda membuat akun atau melakukan pembelian, kami mengumpulkan data dasar seperti nama, alamat email, nomor telepon, dan alamat pengiriman Anda untuk keperluan memproses pesanan Anda.</p>
          
          <h3>Keamanan Data</h3>
          <p>Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga mana pun.</p>
          
          <p><em>(Halaman ini adalah contoh tampilan sementara. Pastikan untuk meninjau kebijakan ini sesuai dengan hukum perlindungan data lokal Anda).</em></p>
        </div>
      </div>
    </div>
  )
}
