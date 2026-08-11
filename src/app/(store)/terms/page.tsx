import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Raxie',
  description: 'Syarat dan Ketentuan layanan toko Raxie.',
}

export default function TermsPage() {
  return (
        <div className="mt-8 max-w-3xl space-y-6">
          <div>
            <h1 className="font-serif font-extrabold text-3xl md:text-4xl mb-2 uppercase tracking-tight text-black dark:text-white">Syarat & Ketentuan Layanan</h1>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs">Terakhir diperbarui: <em>Agustus 2026</em></p>
          </div>

          <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm">
            Selamat datang di Raxie. Dengan mengakses, menelusuri, atau melakukan pembelian di website ini, 
            Anda setuju untuk mematuhi dan terikat oleh Syarat dan Ketentuan berikut.
            Mohon baca dengan saksama sebelum menggunakan layanan kami.
          </p>

          <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm space-y-6">
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">1. Ketentuan Umum</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
                Raxie berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian dari Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya.
                Penggunaan website secara berkelanjutan setelah perubahan diposting berarti Anda menerima dan menyetujui perubahan tersebut.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">2. Harga & Pembayaran</h2>
              <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed space-y-1">
                <li>Semua harga yang tercantum di website adalah dalam mata uang Rupiah (IDR).</li>
                <li>Raxie berhak mengubah harga produk sewaktu-waktu tanpa pemberitahuan sebelumnya. Namun, pesanan yang sudah dibayar tidak akan dikenakan perubahan harga.</li>
                <li>Semua transaksi pembayaran diproses melalui <strong className="text-black dark:text-white">Payment Gateway Resmi (Midtrans)</strong>. Kami memastikan standar keamanan tingkat perbankan untuk melindungi data transaksi Anda.</li>
                <li>Pesanan yang belum dibayar dalam batas waktu yang ditentukan (biasanya 24 jam) akan otomatis dibatalkan oleh sistem.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">3. Ketersediaan Produk & Pengiriman</h2>
              <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed space-y-1">
                <li>Kami berusaha sebaik mungkin memastikan stok di website akurat. Namun, jika terjadi kesalahan sistem dan barang yang Anda pesan kosong, kami berhak membatalkan pesanan dan mengembalikan dana Anda 100%.</li>
                <li>Pesanan akan diproses pada hari kerja (Senin - Jumat). Pesanan yang masuk pada akhir pekan atau hari libur nasional akan diproses pada hari kerja berikutnya.</li>
                <li>Keterlambatan pengiriman oleh pihak ekspedisi berada di luar kendali Raxie, namun kami siap membantu melacak status pengiriman Anda.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">4. Deskripsi & Visual Produk</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
                Kami berusaha menampilkan warna dan detail produk seakurat mungkin. Namun, karena perbedaan kalibrasi layar monitor atau layar ponsel Anda, warna produk asli mungkin sedikit berbeda. 
                Seluruh produk Raxie dibuat menggunakan material PU Leather Premium (kulit sintetis berkualitas tinggi) yang konsisten, presisi, dan mudah dibersihkan.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">5. Kebijakan Privasi Data</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
                Data pribadi Anda yang dikumpulkan selama proses pendaftaran dan *checkout* (seperti nama, alamat, nomor telepon, email) hanya akan digunakan secara internal untuk memproses pesanan dan tidak akan dijual ke pihak ketiga manapun.
              </p>
            </div>

            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white mb-2">6. Hak Kekayaan Intelektual</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed">
                Seluruh konten, logo, desain produk, gambar, dan teks yang ada di website ini adalah hak milik Raxie dan dilindungi oleh undang-undang hak cipta Republik Indonesia.
                Dilarang keras menyalin atau menggunakan konten tanpa izin tertulis dari pihak Raxie.
              </p>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-sm border border-neutral-200 dark:border-neutral-800 mt-8">
              <h4 className="font-bold text-black dark:text-white text-[11px] uppercase tracking-wider mb-3">Informasi Kontak Hukum:</h4>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-1"><strong className="text-black dark:text-white">Raxie Leather Goods</strong></p>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-1"><strong className="text-black dark:text-white">Email:</strong> raxieleather@gmail.com</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium"><strong className="text-black dark:text-white">WhatsApp:</strong> 0821-2886-2433</p>
            </div>
          </div>
        </div>
    </div>
  )
}
