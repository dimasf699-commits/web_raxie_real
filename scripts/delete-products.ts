import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Menghapus semua produk dari database...')
  
  // Karena Product terhubung ke OrderItem tanpa Cascade, 
  // kita mungkin perlu menghapus OrderItem atau Order terlebih dahulu jika ada.
  // Untuk amannya, kita bersihkan Order juga agar bersih.
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  
  // Hapus produk
  const deletedProducts = await prisma.product.deleteMany({})
  
  // Hapus kategori opsional (jika ingin dari awal)
  // await prisma.category.deleteMany({})
  
  console.log(`Berhasil menghapus ${deletedProducts.count} produk.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
