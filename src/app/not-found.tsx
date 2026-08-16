import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-[70vh] flex flex-col items-center justify-center transition-colors duration-300">
      <div className="container-raxie text-center px-4">
        <h1 className="text-[120px] md:text-[180px] font-serif font-extrabold text-[#C19A6B] leading-none tracking-tight">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mt-4 mb-6">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10 text-sm md:text-base">
          Maaf, halaman produk atau artikel yang Anda cari mungkin sudah dipindahkan atau tidak lagi tersedia.
        </p>
        
        <Link 
          href="/products" 
          className="inline-flex items-center justify-center gap-2 bg-[#0B0B0B] dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-sm hover:bg-[#C19A6B] dark:hover:bg-[#C19A6B] hover:text-white transition-colors duration-300"
        >
          Lihat Koleksi RAXIE <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
