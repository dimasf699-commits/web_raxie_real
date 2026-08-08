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
                <span>Material apa yang digunakan pada produk Raxie?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Seluruh produk Raxie dibuat menggunakan <strong>PU Leather Premium (kulit sintetis berkualitas tinggi)</strong>. Material ini dirancang khusus agar tahan terhadap ciptaan air, tidak gampang terkelupas, mudah dibersihkan, serta memiliki tampilan presisi dan elegan.</p>
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
                <span>Bagaimana cara merawat dompet PU Leather Raxie agar awet?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <div className="text-muted-foreground p-5 pt-0 border-t border-border/50 bg-muted/20">
                <p>Material PU Leather Premium Raxie sangat mudah dirawat:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Jika terkena noda atau kotoran, cukup lap dengan kain lembut yang sedikit lembap.</li>
                  <li>Hindari menyimpan di tempat basah atau terlalu lembap dalam waktu lama.</li>
                  <li>Jauhkan dari benda tajam atau gesekan kasar untuk menjaga kerapian permukaan.</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
