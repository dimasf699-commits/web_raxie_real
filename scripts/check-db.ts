import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
      variants: true,
    }
  })

  console.log("Latest Products:")
  products.forEach(p => {
    console.log(`- ${p.name} (Base Price: ${p.basePrice})`)
    console.log(`  Images: ${p.images.length}`)
    if (p.images.length > 0) console.log(`  First Image URL: ${p.images[0].url}`)
    console.log(`  Variants: ${p.variants.length}`)
    if (p.variants.length > 0) {
      console.log(`  First Variant: ${p.variants[0].name}, Price: ${p.variants[0].price}, Stock: ${p.variants[0].stock}`)
    }
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
