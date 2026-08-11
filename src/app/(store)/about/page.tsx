import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ShieldCheck, Sparkles, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tentang Raxie | Raxie',
  description: 'Mengenal lebih dekat Raxie — brand aksesori PU Leather premium dari Garut, Jawa Barat. Produk berkualitas, harga terjangkau.',
}

export default function AboutPage() {
  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen py-10 transition-colors duration-300">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Tentang Kami', href: '/about' },
          ]}
        />
        
        <div className="mt-8 space-y-12">
          {/* Header */}
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <span className="text-[#C19A6B] text-xs font-extrabold tracking-[0.25em] uppercase block">
              OUR BRAND STORY
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-black dark:text-white">
              TENTANG RAXIE
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs md:text-sm leading-relaxed">
              "Aksesori yang baik bukan tentang harga — melainkan tentang desain yang tepat, material yang tahan lama, dan nilai yang sepadan."
            </p>
          </div>

          <div className="space-y-6 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-white dark:bg-[#151515] p-6 md:p-10 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <p>
              <strong className="text-black dark:text-white">RAXIE</strong> hadir dengan satu misi sederhana: menghadirkan aksesori dompet dan tas berkualitas yang dapat dijangkau oleh semua kalangan tanpa harus mengorbankan tampilan dan ketahanan.
            </p>
            <p>
              Di dunia di mana tren fesyen datang silih berganti dengan cepat, kami memilih untuk fokus pada hal yang penting: produk yang benar-benar fungsional, tahan lama, dan memiliki nilai estetika tinggi.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#C19A6B] uppercase tracking-wider pt-4">
              Material Utama: PU Leather Premium
            </h2>
            <p>
              Seluruh produk RAXIE menggunakan material <strong className="text-black dark:text-white">PU Leather (kulit sintetis premium)</strong> — material modern yang dikenal karena ketahanannya terhadap air, mudah dibersihkan, dan tampilannya yang rapi dan konsisten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-2">
                <Sparkles className="w-5 h-5 text-[#C19A6B]" />
                <h3 className="font-bold text-black dark:text-white text-[11px] uppercase tracking-wider">💧 Tahan Air</h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Material PU Leather tidak mudah rusak oleh percikan air dan kelembaban.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-2">
                <Award className="w-5 h-5 text-[#C19A6B]" />
                <h3 className="font-bold text-black dark:text-white text-[11px] uppercase tracking-wider">🌿 Craftsmanship</h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Dibuat oleh pengrajin berpengalaman dengan kontrol kualitas yang ketat.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-2">
                <ShieldCheck className="w-5 h-5 text-[#C19A6B]" />
                <h3 className="font-bold text-black dark:text-white text-[11px] uppercase tracking-wider">💰 Value for Money</h3>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Kualitas premium dengan harga yang masuk akal dan garansi 1 tahun.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#151515] p-6 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#C19A6B] uppercase tracking-wider">Visi Kami</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">Menjadi brand aksesori kebanggaan Indonesia yang dikenal karena desain bersih, kualitas konsisten, dan harga yang jujur.</p>
            </div>
            <div className="bg-white dark:bg-[#151515] p-6 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#C19A6B] uppercase tracking-wider">Misi Kami</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">Memberikan pengalaman memiliki aksesori PU Leather berkualitas dengan harga yang masuk akal, tanpa klaim berlebihan.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151515] p-6 md:p-8 rounded-sm border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs shadow-sm">
            <h3 className="font-serif text-sm font-bold text-[#C19A6B] uppercase tracking-wider">INFORMASI KONTAK</h3>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium"><strong className="text-black dark:text-white">Alamat:</strong> Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat</p>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium"><strong className="text-black dark:text-white">Email Resmi:</strong> raxieleather@gmail.com</p>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium"><strong className="text-black dark:text-white">WhatsApp:</strong> 0821-2886-2433</p>
          </div>
        </div>
      </div>
    </div>
  )
}
