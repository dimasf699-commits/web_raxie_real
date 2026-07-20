import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai proses seeding database...')

  // Hapus data lama agar bersih
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // 1. Buat Kategori
  const catDompet = await prisma.category.create({
    data: {
      name: 'Dompet',
      slug: 'dompet',
      description: 'Koleksi dompet kulit premium'
    }
  })

  const catAksesoris = await prisma.category.create({
    data: {
      name: 'Aksesoris',
      slug: 'aksesoris',
      description: 'Aksesoris kulit asli'
    }
  })

  // 2. Buat Produk 1
  const product1 = await prisma.product.create({
    data: {
      name: 'Dompet Kulit Pria Bifold Classic',
      slug: 'dompet-kulit-pria-bifold-classic',
      description: 'Dompet bifold klasik yang dibuat dengan 100% kulit sapi asli. Menawarkan desain timeless dengan fungsionalitas maksimal untuk menyimpan kartu dan uang tunai Anda dengan aman.',
      shortDescription: 'Dompet bifold klasik dari kulit asli.',
      categoryId: catDompet.id,
      basePrice: 450000,
      compareAtPrice: 550000,
      isFeatured: true,
      isBestSeller: true,
      material: 'Genuine Cow Leather',
      avgRating: 4.8,
      reviewCount: 124,
      totalSold: 350,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800', sortOrder: 0 },
          { url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=800', sortOrder: 1 },
        ]
      },
      variants: {
        create: [
          { sku: 'WL-BF-BLK', name: 'Hitam', color: 'Hitam', colorHex: '#1A1611', price: 450000, stock: 15 },
          { sku: 'WL-BF-BRN', name: 'Coklat Tua', color: 'Coklat Tua', colorHex: '#4A3728', price: 450000, stock: 8 },
        ]
      }
    }
  })

  // 3. Buat Produk 2
  const product2 = await prisma.product.create({
    data: {
      name: 'Card Holder Minimalis Premium',
      slug: 'card-holder-minimalis-premium',
      description: 'Desain ultra-tipis untuk Anda yang hanya membawa kartu esensial. Dilengkapi dengan teknologi RFID blocking untuk keamanan ganda.',
      shortDescription: 'Card holder tipis dengan RFID blocking.',
      categoryId: catDompet.id,
      basePrice: 210000,
      isNew: true,
      material: 'Vegetable Tanned Leather',
      avgRating: 4.9,
      reviewCount: 89,
      totalSold: 210,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=800', sortOrder: 0 },
        ]
      },
      variants: {
        create: [
          { sku: 'CH-MN-TAN', name: 'Tan', color: 'Tan', colorHex: '#D2B48C', price: 210000, stock: 25 },
        ]
      }
    }
  })

  // 4. Buat Produk 3
  const product3 = await prisma.product.create({
    data: {
      name: 'Gantungan Kunci Kulit Vintage',
      slug: 'gantungan-kunci-kulit-vintage',
      description: 'Aksesoris mungil namun elegan. Menggunakan sisa potongan kulit premium kami (zero waste) yang disatukan dengan ring kuningan antik.',
      categoryId: catAksesoris.id,
      basePrice: 750000,
      avgRating: 4.5,
      reviewCount: 45,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&q=80&w=800', sortOrder: 0 },
        ]
      },
      variants: {
        create: [
          { sku: 'KC-VT-BRN', name: 'Vintage Brown', color: 'Coklat', colorHex: '#8B4513', price: 750000, stock: 50 },
        ]
      }
    }
  })

  console.log('✅ Seeding selesai! Berhasil menambahkan 3 produk ke database.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
