import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Lokasi Toko | Raxie',
  description: 'Temukan toko fisik dan mitra resmi Raxie di kota Anda.',
}

export default function StoreLocatorPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Toko Kami', href: '/store-locator' },
          ]}
        />
        
        <div className="mt-8 max-w-3xl space-y-6">
          <h1 className="font-serif font-extrabold text-3xl md:text-4xl mb-4 uppercase tracking-tight text-black dark:text-white">Lokasi Toko Kami</h1>
          
          <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm space-y-4 text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-300 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
              Saat ini, seluruh produk Raxie didistribusikan secara online melalui website resmi ini. Kami sedang mempersiapkan toko fisik (Flagship Store) agar Anda dapat melihat dan merasakan langsung kualitas produk kulit kami.
            </p>
            <p className="text-neutral-400 dark:text-neutral-500 text-[10px] italic pt-4">
              *(Halaman ini adalah contoh tampilan sementara. Jika Anda memiliki toko offline (fisik), Anda dapat memasukkan alamat, jam operasional, dan peta lokasi di sini.)*
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
