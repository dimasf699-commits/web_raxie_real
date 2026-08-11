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
        
        <div className="mt-8 max-w-3xl space-y-6">
          <h1 className="font-serif font-extrabold text-3xl md:text-4xl mb-4 uppercase tracking-tight text-black dark:text-white">Kebijakan Privasi</h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs md:text-sm leading-relaxed">
            Raxie ("kami") menghormati privasi Anda dan berkomitmen untuk melindunginya melalui kepatuhan kami terhadap kebijakan ini.
          </p>
          
          <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">Data Apa yang Kami Kumpulkan</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">Saat Anda membuat akun atau melakukan pembelian, kami mengumpulkan data dasar seperti nama, alamat email, nomor telepon, dan alamat pengiriman Anda untuk keperluan memproses pesanan Anda.</p>
            
            <h3 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white pt-4">Keamanan Data</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga mana pun.</p>
            
            <p className="text-neutral-400 dark:text-neutral-500 text-[10px] italic pt-4">*(Halaman ini adalah contoh tampilan sementara. Pastikan untuk meninjau kebijakan ini sesuai dengan hukum perlindungan data lokal Anda).*</p>
          </div>
        </div>
      </div>
    </div>
  )
}
