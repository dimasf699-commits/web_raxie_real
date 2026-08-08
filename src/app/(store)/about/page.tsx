import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ShieldCheck, Sparkles, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tentang Raxie | Raxie',
  description: 'Mengenal lebih dekat Raxie — brand aksesori PU Leather premium dari Garut, Jawa Barat. Produk berkualitas, harga terjangkau.',
}

export default function AboutPage() {
  return (
    <div className="bg-black text-white min-h-screen py-10">
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
            <h1 className="font-serif text-3xl md:text-5xl font-bold uppercase tracking-wider text-white">
              TENTANG RAXIE
            </h1>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
              "Aksesori yang baik bukan tentang harga — melainkan tentang desain yang tepat, material yang tahan lama, dan nilai yang sepadan."
            </p>
          </div>

          <div className="space-y-6 text-xs text-neutral-300 leading-relaxed bg-[#121212] p-6 md:p-10 rounded-2xl border border-neutral-800">
            <p>
              <strong className="text-white">RAXIE</strong> hadir dengan satu misi sederhana: menghadirkan aksesori dompet dan tas berkualitas yang dapat dijangkau oleh semua kalangan tanpa harus mengorbankan tampilan dan ketahanan.
            </p>
            <p>
              Di dunia di mana tren fesyen datang silih berganti dengan cepat, kami memilih untuk fokus pada hal yang penting: produk yang benar-benar fungsional, tahan lama, dan memiliki nilai estetika tinggi.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#C19A6B] uppercase tracking-wider pt-4">
              Material Utama: PU Leather Premium
            </h2>
            <p>
              Seluruh produk RAXIE menggunakan material <strong className="text-white">PU Leather (kulit sintetis premium)</strong> — material modern yang dikenal karena ketahanannya terhadap air, mudah dibersihkan, dan tampilannya yang rapi dan konsisten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-2">
                <Sparkles className="w-5 h-5 text-[#C19A6B]" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">💧 Tahan Air</h3>
                <p className="text-[11px] text-neutral-400">Material PU Leather tidak mudah rusak oleh percikan air dan kelembaban.</p>
              </div>

              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-2">
                <Award className="w-5 h-5 text-[#C19A6B]" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">🌿 Craftsmanship</h3>
                <p className="text-[11px] text-neutral-400">Dibuat oleh pengrajin berpengalaman dengan kontrol kualitas yang ketat.</p>
              </div>

              <div className="bg-black p-4 rounded-xl border border-neutral-800 space-y-2">
                <ShieldCheck className="w-5 h-5 text-[#C19A6B]" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">💰 Value for Money</h3>
                <p className="text-[11px] text-neutral-400">Kualitas premium dengan harga yang masuk akal dan garansi 1 tahun.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121212] p-6 rounded-2xl border border-neutral-800 space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#C19A6B] uppercase tracking-wider">Visi Kami</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">Menjadi brand aksesori kebanggaan Indonesia yang dikenal karena desain bersih, kualitas konsisten, dan harga yang jujur.</p>
            </div>
            <div className="bg-[#121212] p-6 rounded-2xl border border-neutral-800 space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#C19A6B] uppercase tracking-wider">Misi Kami</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">Memberikan pengalaman memiliki aksesori PU Leather berkualitas dengan harga yang masuk akal, tanpa klaim berlebihan.</p>
            </div>
          </div>

          <div className="bg-[#121212] p-6 md:p-8 rounded-2xl border border-neutral-800 space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-[#C19A6B] uppercase tracking-wider">INFORMASI KONTAK</h3>
            <p className="text-neutral-300"><strong className="text-white">Alamat:</strong> Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat</p>
            <p className="text-neutral-300"><strong className="text-white">Email Resmi:</strong> raxieleather@gmail.com</p>
            <p className="text-neutral-300"><strong className="text-white">WhatsApp:</strong> 0821-2886-2433</p>
          </div>
        </div>
      </div>
    </div>
  )
}
