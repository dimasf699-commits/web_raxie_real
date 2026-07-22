import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// DAFTAR PRODUK YANG AKAN DIMASUKKAN
// Silakan tambah/ubah daftar produk di bawah ini sesuai dengan dagangan Anda.
// ============================================================================
const produkBaru = [
  {
    name: "Dompet Pria Kulit Asli Raxie - Bifold Classic Hitam",
    description: "Dompet pria berbahan kulit asli premium dengan desain bifold klasik. Cocok untuk profesional muda. Awet dan tahan lama.",
    price: 150000, // Harga asli varian (ditampilkan ke pembeli)
    basePrice: 150000, // Harga dasar (sama dengan harga varian)
    compareAtPrice: 200000, // Harga coret diskon (opsional, biarkan 0 jika tidak ada)
    weight: 200, // Berat dalam gram (penting untuk ongkir)
    stock: 50, // Jumlah stok
    sku: "RX-BIFOLD-BLK", // Kode unik barang
    categoryName: "Dompet", // Pastikan kategori ini sudah ada (atau akan dibuat otomatis)
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80" // Ganti dengan link foto Anda jika ada
  },
  {
    name: "Gantungan Kunci Mobil Kulit Sapi",
    description: "Gantungan kunci elegan berbahan kulit sapi asli. Mengamankan kunci mobil atau motor Anda dengan gaya.",
    price: 45000,
    basePrice: 45000,
    compareAtPrice: 0,
    weight: 100,
    stock: 100,
    sku: "RX-KEY-BRN",
    categoryName: "Aksesoris",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"
  },
  // Anda bisa meng-copy paste blok { ... } di atas untuk menambah 10, 50, atau 100 produk sekaligus!
]

async function main() {
  console.log('🚀 Memulai proses masukin produk massal...')

  let successCount = 0

  for (const item of produkBaru) {
    try {
      // 1. Cari atau buat kategori otomatis
      let category = await prisma.category.findFirst({
        where: { name: { equals: item.categoryName, mode: 'insensitive' } }
      })
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: item.categoryName,
            slug: item.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }
        })
      }

      // 2. Buat Slug unik untuk produk
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000)

      // 3. Masukkan produk ke database
      await prisma.product.create({
        data: {
          name: item.name,
          slug: slug,
          description: item.description,
          shortDescription: item.description.substring(0, 100) + '...',
          basePrice: item.basePrice,
          compareAtPrice: item.compareAtPrice > 0 ? item.compareAtPrice : null,
          categoryId: category.id,
          weight: item.weight,
          isActive: true,
          images: {
            create: [
              { url: item.imageUrl, sortOrder: 0 }
            ]
          },
          variants: {
            create: [
              {
                sku: item.sku,
                name: "Default",
                price: item.price,
                stock: item.stock,
                sortOrder: 0
              }
            ]
          }
        }
      })
      console.log(`✅ Berhasil menambahkan: ${item.name}`)
      successCount++
    } catch (error) {
      console.error(`❌ Gagal menambahkan ${item.name}:`, error)
    }
  }

  console.log(`\n🎉 SELESAI! Berhasil memasukkan ${successCount} produk.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
