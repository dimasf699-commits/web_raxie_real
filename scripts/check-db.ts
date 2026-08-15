import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  console.log(`Total products in DB: ${count}`)

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      images: true,
      variants: true,
      category: true,
    }
  })

  console.log("Products:")
  products.forEach(p => {
    console.log(`\nProduct: "${p.name}" (ID: ${p.id})`)
    console.log(`- Slug: ${p.slug}`)
    console.log(`- Base Price: ${p.basePrice}`)
    console.log(`- Category: ${p.category?.name}`)
    console.log(`- Images count: ${p.images.length}`)
    p.images.forEach((img, idx) => console.log(`  [${idx}] URL: "${img.url}"`))
    console.log(`- Variants count: ${p.variants.length}`)
    p.variants.forEach((v, idx) => console.log(`  [${idx}] Variant: "${v.name}", Price: ${v.price}, Stock: ${v.stock}`))
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
