import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Kebijakan Pengembalian & Garansi | Raxie',
  description: 'Syarat dan ketentuan pengembalian barang, refund, dan garansi resmi Raxie.',
}

export default function ReturnPolicyPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-3xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Kebijakan Pengembalian', href: '/return-policy' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert max-w-none">
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-8">Kebijakan Pengembalian Dana & Garansi</h1>
          
          <p>
            Di Raxie, kami berkomitmen menyajikan produk kulit full-grain dengan standar kualitas tertinggi. 
            Namun, kami menyadari bahwa terkadang produk yang Anda terima mungkin tidak sesuai ekspektasi atau mengalami kendala pengiriman.
            Oleh karena itu, kami menyediakan kebijakan pengembalian dana (refund) dan garansi untuk melindungi Anda.
          </p>

          <h2>1. Syarat Pengembalian Barang (Retur)</h2>
          <p>Anda dapat mengajukan pengembalian barang apabila memenuhi kriteria berikut:</p>
          <ul>
            <li>Barang diterima dalam kondisi cacat produksi (misal: jahitan lepas, resleting rusak, kulit robek).</li>
            <li>Barang yang diterima tidak sesuai dengan pesanan Anda (salah warna atau salah model).</li>
            <li>Permintaan retur diajukan maksimal <strong>7x24 jam</strong> sejak barang berstatus "Diterima" berdasarkan resi pelacakan kurir.</li>
            <li>Barang belum pernah dipakai untuk aktivitas di luar ruangan, belum dicuci, dan tidak ada bau atau noda parfum/keringat.</li>
            <li>Hangtag, kartu garansi, dan kemasan box orisinal masih lengkap dan utuh.</li>
          </ul>

          <h2>2. Proses Pengembalian Dana (Refund)</h2>
          <p>Jika pengajuan retur Anda disetujui, kami menawarkan dua opsi:</p>
          <ul>
            <li><strong>Tukar Barang:</strong> Kami akan mengirimkan barang pengganti yang baru ke alamat Anda secara gratis.</li>
            <li><strong>Pengembalian Uang (Refund):</strong> Dana akan dikembalikan penuh (100%) ke rekening bank, e-wallet, atau limit kartu kredit Anda. Proses pencairan dana membutuhkan waktu <strong>3-5 hari kerja</strong> setelah barang retur kami terima di gudang dan lolos proses inspeksi.</li>
          </ul>

          <h2>3. Garansi Kulit Raxie</h2>
          <p>Karena kami menggunakan kulit sapi asli tipe <em>Full-Grain</em>, kami memberikan <strong>Garansi Material Kulit selama 12 Bulan</strong>. Garansi ini mencakup masalah terkelupasnya kulit secara tidak wajar. Garansi <strong>tidak</strong> mencakup:</p>
          <ul>
            <li>Goresan atau noda akibat kelalaian pemakaian (terkena tinta, benda tajam, bahan kimia).</li>
            <li>Kerusakan akibat penyimpanan di tempat lembap yang memicu timbulnya jamur.</li>
            <li>Keausan wajar pada warna kulit yang merupakan karakteristik alami kulit asli (patina).</li>
          </ul>

          <h2>4. Cara Mengajukan Klaim</h2>
          <p>Untuk memulai proses pengembalian atau klaim garansi, silakan hubungi tim Customer Service kami dengan melampirkan:</p>
          <ol>
            <li>Nomor Pesanan (Order ID)</li>
            <li>Video *Unboxing* (Wajib untuk klaim barang kurang atau salah warna)</li>
            <li>Foto detail kerusakan pada barang</li>
          </ol>
          
          <div className="bg-muted p-6 rounded-xl mt-8 not-prose">
            <h4 className="font-bold mb-2">Hubungi Tim Bantuan Raxie:</h4>
            <p className="text-muted-foreground text-sm mb-1"><strong>Email:</strong> support@raxie.id</p>
            <p className="text-muted-foreground text-sm"><strong>WhatsApp:</strong> 0812-3456-7890 (Senin - Jumat, 09.00 - 17.00 WIB)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
