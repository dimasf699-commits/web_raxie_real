import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Tentang Raxie | Raxie',
  description: 'Mengenal lebih dekat Raxie, dedikasi kami pada kerajinan kulit premium.',
}

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Tentang Kami', href: '/about' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert max-w-none">
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-8">Kisah Kami: Raxie Leather Goods</h1>
          
          <p className="lead text-xl text-muted-foreground font-serif italic mb-10">
            "Lebih dari sekadar dompet; ini adalah pendamping setia yang menua bersama Anda, menyimpan setiap jejak perjalanan dalam guratan kulitnya."
          </p>

          <p>
            Berawal dari kecintaan mendalam terhadap seni kerajinan tangan dan material kulit asli, <strong>Raxie</strong> lahir dengan satu misi sederhana: menghadirkan barang-barang kulit premium yang tak lekang oleh waktu, namun tetap dapat dijangkau oleh semua kalangan.
          </p>
          
          <p>
            Di dunia di mana tren fesyen datang silih berganti dengan cepat (fast fashion), kami memilih untuk melambat. Kami merancang setiap produk Raxie agar mampu bertahan selama bertahun-tahun. Kami percaya bahwa barang kulit terbaik bukanlah barang yang terlihat sempurna di hari pertama Anda membelinya, melainkan barang yang terlihat semakin indah dan berkarakter pada tahun kelima Anda menggunakannya.
          </p>

          <h2>Kualitas Tanpa Kompromi (Full-Grain Leather)</h2>
          <p>
            Rahasia di balik keawetan produk kami terletak pada pemilihan material. Kami dengan bangga hanya menggunakan <strong>Kulit Sapi Asli berjenis Full-Grain</strong>—lapisan kulit paling atas yang tidak diamplas atau dikikis. Ini berarti serat kulit terkuat tetap utuh, memberikan daya tahan luar biasa dan kemampuan untuk mengembangkan <em>Patina</em> (perubahan warna alami yang indah) seiring pemakaian.
          </p>
          <p>
            Setiap dompet, sabuk, dan tas Raxie dipotong, dijahit, dan di-finishing oleh tangan-tangan pengrajin lokal Indonesia yang telah mendedikasikan hidupnya untuk menyempurnakan seni kerajinan kulit. Membeli Raxie berarti Anda turut mendukung pelestarian industri kreatif dan kerajinan tangan lokal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
            <div className="bg-tan-50/50 p-6 rounded-2xl border border-tan-100">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Visi Kami</h3>
              <p className="text-muted-foreground">Menjadi merek barang kulit (leather goods) kebanggaan Indonesia yang dikenal dunia karena durabilitas, desain klasik, dan komitmen terhadap kualitas.</p>
            </div>
            <div className="bg-tan-50/50 p-6 rounded-2xl border border-tan-100">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Misi Kami</h3>
              <p className="text-muted-foreground">Memberikan pengalaman memiliki kerajinan kulit Full-Grain berkualitas ekspor dengan harga yang masuk akal, tanpa mengorbankan kesejahteraan pengrajin lokal.</p>
            </div>
          </div>

          <hr className="my-10 border-border" />

          <h2>Informasi Bisnis & Kontak</h2>
          <p>
            Kami selalu senang mendengar masukan dari Anda, menjawab pertanyaan seputar produk, atau membantu kendala pesanan. Jangan ragu untuk menghubungi kami melalui saluran resmi di bawah ini:
          </p>
          
          <div className="bg-muted p-6 rounded-xl mt-8 not-prose">
            <p className="text-muted-foreground mb-2"><strong>Nama Bisnis:</strong> Raxie Leather Goods</p>
            <p className="text-muted-foreground mb-2"><strong>Alamat Operasional:</strong> Jl. Kulit Asli No. 99, Bandung, Jawa Barat, Indonesia (Hanya melayani pengiriman online)</p>
            <p className="text-muted-foreground mb-2"><strong>Email Resmi:</strong> support@raxie.id</p>
            <p className="text-muted-foreground"><strong>Layanan WhatsApp (Teks Saja):</strong> 0812-3456-7890</p>
            <p className="text-xs text-muted-foreground mt-4 italic">*Jam Operasional Customer Service: Senin - Jumat (09.00 - 17.00 WIB)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
