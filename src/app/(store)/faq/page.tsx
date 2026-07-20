import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'FAQ | Raxie',
  description: 'Pertanyaan yang sering diajukan seputar produk dan layanan Raxie.',
}

export default function FAQPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'FAQ', href: '/faq' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert">
          <h1 className="font-serif font-bold text-3xl md:text-4xl mb-8">Pusat Bantuan & FAQ</h1>
          <p>
            Temukan jawaban untuk pertanyaan yang paling sering diajukan seputar produk, pembayaran, dan pengiriman Raxie.
          </p>

          <div className="space-y-4 mt-8 not-prose">
            <details className="group border border-border bg-card rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-foreground hover:bg-muted/50 transition-colors">
                <span>Apakah produk Raxie menggunakan kulit asli?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Ya, 100%. Kami tidak menggunakan kulit sintetis (PU/PVC). Kami mendedikasikan diri untuk hanya menggunakan kulit sapi asli berjenis Full-Grain, material kulit dengan ketahanan tertinggi dan mampu mengembangkan warna alami (patina) yang indah.</p>
              </div>
            </details>

            <details className="group border border-border bg-card rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-foreground hover:bg-muted/50 transition-colors">
                <span>Metode pembayaran apa saja yang diterima?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Kami memproses pembayaran secara aman melalui Midtrans. Anda dapat membayar menggunakan:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Virtual Account (BCA, Mandiri, BNI, BRI)</li>
                  <li>E-Wallet (GoPay, ShopeePay, QRIS)</li>
                  <li>Kartu Kredit / Debit berlogo Visa/Mastercard</li>
                  <li>Gerai Retail (Indomaret / Alfamart)</li>
                </ul>
              </div>
            </details>

            <details className="group border border-border bg-card rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-foreground hover:bg-muted/50 transition-colors">
                <span>Berapa lama estimasi pengiriman pesanan?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Pesanan yang masuk sebelum jam 15.00 WIB akan dikirim pada hari yang sama. Estimasi perjalanan kurir:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Pulau Jawa:</strong> 1-3 Hari Kerja</li>
                  <li><strong>Luar Pulau Jawa:</strong> 3-7 Hari Kerja</li>
                </ul>
                <p className="mt-2">Anda akan menerima resi pengiriman melalui email saat paket sudah diserahkan ke kurir.</p>
              </div>
            </details>

            <details className="group border border-border bg-card rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-foreground hover:bg-muted/50 transition-colors">
                <span>Apakah saya bisa menukar barang jika ada cacat?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Tentu. Kami memiliki Kebijakan Retur 7 Hari. Jika barang diterima dalam keadaan cacat produksi atau salah kirim, kami akan menukarnya secara gratis atau mengembalikan dana Anda 100%. Silakan kunjungi halaman <a href="/return-policy" className="text-tan-500 underline">Kebijakan Retur</a> untuk info selengkapnya.</p>
              </div>
            </details>

            <details className="group border border-border bg-card rounded-xl overflow-hidden">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-5 text-foreground hover:bg-muted/50 transition-colors">
                <span>Bagaimana cara merawat dompet kulit asli agar awet?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Kulit asli membutuhkan sedikit perawatan agar tetap lentur dan tidak retak:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Hindari paparan sinar matahari langsung yang terlalu lama.</li>
                  <li>Jika basah, jangan gunakan <em>hair dryer</em>; cukup lap dengan kain kering dan angin-anginkan di suhu ruang.</li>
                  <li>Gunakan *leather balm* atau kondisioner kulit setiap 3-6 bulan sekali untuk menjaga kelembapan material.</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
