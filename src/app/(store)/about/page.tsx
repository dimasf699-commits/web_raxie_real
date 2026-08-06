import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Tentang Raxie | Raxie',
  description: 'Mengenal lebih dekat Raxie — brand aksesori PU Leather premium dari Garut, Jawa Barat. Produk berkualitas, harga terjangkau.',
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
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-8">Kisah Kami: Raxie</h1>
          
          <p className="lead text-xl text-muted-foreground font-serif italic mb-10">
            "Aksesori yang baik bukan tentang harga — melainkan tentang desain yang tepat, material yang tahan lama, dan nilai yang sepadan."
          </p>

          <p>
            <strong>Raxie</strong> hadir dengan satu misi sederhana: menghadirkan aksesori dompet berkualitas yang dapat dijangkau oleh semua kalangan tanpa harus mengorbankan tampilan dan ketahanan.
          </p>
          
          <p>
            Di dunia di mana tren fesyen datang silih berganti dengan cepat, kami memilih untuk fokus pada hal yang penting: produk yang benar-benar fungsional, tahan lama, dan punya nilai estetika tinggi.
          </p>

          <h2>Material Kami: PU Leather Premium</h2>
          <p>
            Seluruh produk Raxie menggunakan <strong>PU Leather (kulit sintetis premium)</strong> — material modern yang dikenal karena ketahanannya terhadap air, mudah dibersihkan, dan tampilannya yang rapi dan konsisten. PU Leather juga merupakan pilihan yang <em>ramah lingkungan dan bebas eksploitasi hewan</em> (vegan-friendly).
          </p>
          <p>
            Bagi banyak orang, PU Leather adalah pilihan yang lebih praktis dibanding kulit asli — tidak perlu conditioning khusus, tidak mudah memudar jika terkena air, dan harganya jauh lebih terjangkau dengan tampilan yang tetap elegan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 not-prose">
            {[
              { title: '💧 Tahan Air', desc: 'PU Leather tidak mudah rusak oleh percikan air dan kelembaban.' },
              { title: '🌿 Vegan-Friendly', desc: 'Tidak ada eksploitasi hewan dalam proses produksi kami.' },
              { title: '💰 Value for Money', desc: 'Kualitas premium dengan harga yang masuk akal untuk semua kalangan.' },
            ].map((item) => (
              <div key={item.title} className="bg-tan-50/50 p-5 rounded-2xl border border-tan-100">
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 not-prose">
            <div className="bg-tan-50/50 p-6 rounded-2xl border border-tan-100">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Visi Kami</h3>
              <p className="text-muted-foreground">Menjadi brand aksesori kebanggaan Indonesia yang dikenal karena desain bersih, kualitas konsisten, dan harga yang jujur.</p>
            </div>
            <div className="bg-tan-50/50 p-6 rounded-2xl border border-tan-100">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-4">Misi Kami</h3>
              <p className="text-muted-foreground">Memberikan pengalaman memiliki aksesori PU Leather berkualitas dengan harga yang masuk akal, tanpa klaim berlebihan.</p>
            </div>
          </div>

          <hr className="my-10 border-border" />

          <h2>Garansi & Kebijakan</h2>
          <p>
            Kami percaya pada produk yang kami jual. Setiap pembelian di Raxie dilindungi oleh:
          </p>
          <ul>
            <li><strong>Garansi 30 hari</strong> untuk cacat produksi (bukan kerusakan akibat pemakaian)</li>
            <li><strong>Retur mudah</strong> jika produk tidak sesuai deskripsi</li>
            <li><strong>Pengemasan aman</strong> agar produk tiba dalam kondisi sempurna</li>
          </ul>

          <hr className="my-10 border-border" />

          <h2>Informasi Bisnis &amp; Kontak</h2>
          <p>
            Kami selalu senang mendengar masukan dari Anda, menjawab pertanyaan seputar produk, atau membantu kendala pesanan. Jangan ragu untuk menghubungi kami:
          </p>
          
          <div className="bg-muted p-6 rounded-xl mt-8 not-prose">
            <p className="text-muted-foreground mb-2"><strong>Nama Bisnis:</strong> Raxie</p>
            <p className="text-muted-foreground mb-2"><strong>Alamat:</strong> Kp. Pasirkiamis, Desa Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat, Indonesia</p>
            <p className="text-muted-foreground mb-2"><strong>Email Resmi:</strong> raxieleather@gmail.com</p>
            <p className="text-muted-foreground"><strong>WhatsApp:</strong> 0821-2886-2433</p>
            <p className="text-xs text-muted-foreground mt-4 italic">*Jam Operasional: Senin – Sabtu (08.00 – 17.00 WIB)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
