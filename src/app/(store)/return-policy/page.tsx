import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Kebijakan Pengembalian & Garansi | Raxie',
  description: 'Syarat dan ketentuan pengembalian barang, refund, dan garansi resmi Raxie.',
}

export default function ReturnPolicyPage() {
  return (
        <div className="mt-8 max-w-3xl space-y-6">
          <div>
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl mb-4 uppercase tracking-tight text-black dark:text-white">Kebijakan Pengembalian Dana & Garansi</h1>
          </div>

          <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm">
            Di Raxie, kami berkomitmen menyajikan produk dompet dan aksesoris PU Leather Premium dengan standar kualitas terbaik. 
            Namun, kami menyadari bahwa terkadang produk yang Anda terima mungkin tidak sesuai ekspektasi atau mengalami kendala pengiriman.
            Oleh karena itu, kami menyediakan kebijakan pengembalian dana (refund) dan garansi resmi untuk melindungi Anda.
          </p>

          <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm space-y-6">
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">1. Syarat Pengembalian Barang (Retur)</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed mb-2">Anda dapat mengajukan pengembalian barang apabila memenuhi kriteria berikut:</p>
              <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed space-y-1">
                <li>Barang diterima dalam kondisi cacat produksi (misal: jahitan lepas, resleting rusak, permukaan terkelupas).</li>
                <li>Barang yang diterima tidak sesuai dengan pesanan Anda (salah warna atau salah model).</li>
                <li>Permintaan retur diajukan maksimal <strong className="text-black dark:text-white">7x24 jam</strong> sejak barang berstatus "Diterima" berdasarkan resi pelacakan kurir.</li>
                <li>Barang belum pernah dipakai untuk aktivitas di luar ruangan, belum dicuci, dan tidak ada bau atau noda parfum/keringat.</li>
                <li>Hangtag, kartu garansi, dan kemasan box orisinal masih lengkap dan utuh.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">2. Proses Pengembalian Dana (Refund)</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed mb-2">Jika pengajuan retur Anda disetujui, kami menawarkan dua opsi:</p>
              <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed space-y-1">
                <li><strong className="text-black dark:text-white">Tukar Barang:</strong> Kami akan mengirimkan barang pengganti yang baru ke alamat Anda secara gratis.</li>
                <li><strong className="text-black dark:text-white">Pengembalian Uang (Refund):</strong> Dana akan dikembalikan penuh (100%) ke rekening bank, e-wallet, atau limit kartu kredit Anda. Proses pencairan dana membutuhkan waktu <strong className="text-black dark:text-white">3-5 hari kerja</strong> setelah barang retur kami terima di gudang dan lolos proses inspeksi.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">3. Garansi Material Raxie</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed mb-2">Seluruh produk Raxie menggunakan PU Leather Premium berkualitas tinggi. Kami memberikan <strong className="text-black dark:text-white">Garansi Material selama 12 Bulan</strong> yang mencakup masalah terkelupasnya permukaan kulit secara tidak wajar. Garansi <strong className="text-black dark:text-white">tidak</strong> mencakup:</p>
              <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed space-y-1">
                <li>Goresan atau noda akibat kelalaian pemakaian (terkena tinta, benda tajam, bahan kimia, atau api).</li>
                <li>Kerusakan akibat penyimpanan di tempat lembap yang memicu timbulnya jamur.</li>
                <li>Keausan wajar akibat penggunaan jangka panjang.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">4. Cara Mengajukan Klaim</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed mb-2">Untuk memulai proses pengembalian atau klaim garansi, silakan hubungi tim Customer Service kami dengan melampirkan:</p>
              <ol className="list-decimal pl-5 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed space-y-1">
                <li>Nomor Pesanan (Order ID)</li>
                <li>Video *Unboxing* (Wajib untuk klaim barang kurang atau salah warna)</li>
                <li>Foto detail kerusakan pada barang</li>
              </ol>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-sm border border-neutral-200 dark:border-neutral-800 mt-8">
              <h4 className="font-bold text-black dark:text-white text-[11px] uppercase tracking-wider mb-3">Hubungi Tim Bantuan Raxie:</h4>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-1"><strong className="text-black dark:text-white">Email:</strong> raxieleather@gmail.com</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium"><strong className="text-black dark:text-white">WhatsApp:</strong> 0821-2886-2433 (Senin - Jumat, 09.00 - 17.00 WIB)</p>
            </div>
          </div>
        </div>
    </div>
  )
}
