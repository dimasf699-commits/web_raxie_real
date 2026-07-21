import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Menambahkan produk baru RAXIE Dompet Pria...')

  // Pastikan ada kategori "Dompet"
  let category = await prisma.category.findUnique({ where: { slug: 'dompet' } })
  if (!category) {
    category = await prisma.category.create({
      data: { name: 'Dompet', slug: 'dompet', description: 'Dompet kulit asli' },
    })
  }

  // Tambahkan produk baru
  const product = await prisma.product.create({
    data: {
      name: 'RAXIE Dompet Pria Kulit PU Premium Elegan Wood Grain RX006',
      slug: 'raxie-dompet-pria-kulit-pu-premium-elegan-wood-grain-rx006',
      description: 'Tingkatkan gaya dan fungsionalitas Anda dengan RAXIE Dompet Pria Kulit PU Premium Elegan Wood Grain RX006. Didesain secara presisi dengan tekstur wood grain (serat kayu) yang mewah dan unik, dompet ini memberikan kesan maskulin dan elegan bagi para pria modern.\n\nSpesifikasi:\n- 4 Slot Kartu Debit/Kredit\n- 2 Hidden Pocket\n- 1 Slot Foto/KTP\n- 2 Ruang Uang Kertas Utama\n- Material: Kulit Sintetis (PU Leather) Kualitas Tinggi\n- Ukuran Tertutup: 11 x 10 x 1,5 cm\n- Ukuran Terbuka: 22 x 10 cm\n- Warna Tersedia: Hitam & Cokelat\n\nKeunggulan:\n- Jahitan Rapi & Kuat (Premium Build Quality)\n- Motif Wood Grain Eksklusif\n- Dilengkapi Box Premium Eksklusif Raxie, sangat cocok untuk hadiah.\n\nGaransi pengembalian jika produk rusak.',
      shortDescription: 'Dompet Pria Premium dengan Motif Wood Grain yang elegan dan muat banyak kartu.',
      categoryId: category.id,
      basePrice: 59900,
      compareAtPrice: 90000,
      isFeatured: true,
      isBestSeller: true,
      isNew: true,
      material: 'PU Leather (Kulit Sintetis)',
      weight: 150,
      dimensions: '11 x 10 x 1.5 cm',
      seoTitle: 'RAXIE Dompet Pria Kulit PU Premium Wood Grain RX006 | Raxie',
      seoDescription: 'Beli RAXIE Dompet Pria Kulit PU Premium Elegan Wood Grain RX006. Tersedia warna hitam & cokelat. Original 100%.',
      totalSold: 46,
      viewCount: 120,
      avgRating: 4.9,
      reviewCount: 17,
      images: {
        create: [
          // Gambar-gambar menggunakan URL placeholder yang nanti bisa diubah oleh admin via dashboard
          // karena saat ini kita tidak bisa membaca file gambar langsung dari chat.
          // Kita asumsikan ada URL dari cloudinary atau lokal /images/...
          { url: 'https://res.cloudinary.com/gdewcnnr/image/upload/v1700000001/raxie/dompet-black-box.jpg', sortOrder: 0, altText: 'RAXIE Wood Grain dengan Box' },
          { url: 'https://res.cloudinary.com/gdewcnnr/image/upload/v1700000002/raxie/dompet-black-front.jpg', sortOrder: 1, altText: 'RAXIE Wood Grain Depan' },
          { url: 'https://res.cloudinary.com/gdewcnnr/image/upload/v1700000003/raxie/dompet-black-dimensions.jpg', sortOrder: 2, altText: 'Dimensi Dompet RAXIE' },
          { url: 'https://res.cloudinary.com/gdewcnnr/image/upload/v1700000004/raxie/dompet-black-inside.jpg', sortOrder: 3, altText: 'Bagian Dalam Dompet RAXIE' },
        ],
      },
      variants: {
        create: [
          {
            sku: 'RX006-BLK',
            name: 'Hitam',
            color: 'Hitam',
            colorHex: '#1a1a1a',
            price: 59900,
            stock: 100,
            sortOrder: 0,
          },
          {
            sku: 'RX006-BRN',
            name: 'Cokelat',
            color: 'Cokelat',
            colorHex: '#5c4033',
            price: 59900,
            stock: 50,
            sortOrder: 1,
          }
        ]
      },
    },
  })

  console.log('Berhasil menambahkan produk:', product.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
