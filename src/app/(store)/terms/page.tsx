import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Raxie',
  description: 'Syarat dan Ketentuan layanan toko Raxie.',
}

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-3xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Syarat & Ketentuan', href: '/terms' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert max-w-none">
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-8">Syarat & Ketentuan Layanan</h1>
          
          <p>Terakhir diperbarui: <em>Agustus 2024</em></p>

          <p>
            Selamat datang di Raxie. Dengan mengakses, menelusuri, atau melakukan pembelian di website ini, 
            Anda setuju untuk mematuhi dan terikat oleh Syarat dan Ketentuan berikut.
            Mohon baca dengan saksama sebelum menggunakan layanan kami.
          </p>

          <h2>1. Ketentuan Umum</h2>
          <p>
            Raxie berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian dari Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya.
            Penggunaan website secara berkelanjutan setelah perubahan diposting berarti Anda menerima dan menyetujui perubahan tersebut.
          </p>

          <h2>2. Harga & Pembayaran</h2>
          <ul>
            <li>Semua harga yang tercantum di website adalah dalam mata uang Rupiah (IDR).</li>
            <li>Raxie berhak mengubah harga produk sewaktu-waktu tanpa pemberitahuan sebelumnya. Namun, pesanan yang sudah dibayar tidak akan dikenakan perubahan harga.</li>
            <li>Semua transaksi pembayaran diproses melalui <strong>Payment Gateway Resmi (Midtrans)</strong>. Kami memastikan standar keamanan tingkat perbankan untuk melindungi data transaksi Anda.</li>
            <li>Pesanan yang belum dibayar dalam batas waktu yang ditentukan (biasanya 24 jam) akan otomatis dibatalkan oleh sistem.</li>
          </ul>

          <h2>3. Ketersediaan Produk & Pengiriman</h2>
          <ul>
            <li>Kami berusaha sebaik mungkin memastikan stok di website akurat. Namun, jika terjadi kesalahan sistem dan barang yang Anda pesan kosong, kami berhak membatalkan pesanan dan mengembalikan dana Anda 100%.</li>
            <li>Pesanan akan diproses pada hari kerja (Senin - Jumat). Pesanan yang masuk pada akhir pekan atau hari libur nasional akan diproses pada hari kerja berikutnya.</li>
            <li>Keterlambatan pengiriman oleh pihak ekspedisi berada di luar kendali Raxie, namun kami siap membantu melacak status pengiriman Anda.</li>
          </ul>

          <h2>4. Deskripsi & Visual Produk</h2>
          <p>
            Kami berusaha menampilkan warna dan detail produk seakurat mungkin. Namun, karena perbedaan kalibrasi layar monitor atau layar ponsel Anda, warna produk asli mungkin sedikit berbeda. 
            Selain itu, karakteristik kulit asli <em>(genuine leather)</em> memiliki tekstur dan guratan alami yang membuat setiap produk unik; ini bukanlah sebuah cacat.
          </p>

          <h2>5. Kebijakan Privasi Data</h2>
          <p>
            Data pribadi Anda yang dikumpulkan selama proses pendaftaran dan *checkout* (seperti nama, alamat, nomor telepon, email) hanya akan digunakan secara internal untuk memproses pesanan dan tidak akan dijual ke pihak ketiga manapun.
          </p>

          <h2>6. Hak Kekayaan Intelektual</h2>
          <p>
            Seluruh konten, logo, desain produk, gambar, dan teks yang ada di website ini adalah hak milik Raxie dan dilindungi oleh undang-undang hak cipta Republik Indonesia.
            Dilarang keras menyalin atau menggunakan konten tanpa izin tertulis dari pihak Raxie.
          </p>
          
          <div className="bg-muted p-6 rounded-xl mt-8 not-prose">
            <h4 className="font-bold mb-2">Informasi Kontak Hukum:</h4>
            <p className="text-muted-foreground text-sm mb-1"><strong>Raxie Leather Goods</strong></p>
            <p className="text-muted-foreground text-sm mb-1"><strong>Email:</strong> legal@raxie.id</p>
            <p className="text-muted-foreground text-sm"><strong>WhatsApp:</strong> 0812-3456-7890</p>
          </div>
        </div>
      </div>
    </div>
  )
}
