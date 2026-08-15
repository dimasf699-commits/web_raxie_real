import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'RX006', mode: 'insensitive' } },
        { slug: { contains: 'rx006', mode: 'insensitive' } },
        { reviewCount: { gt: 0 } },
        { avgRating: { gt: 0 } },
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      avgRating: true,
      reviewCount: true,
      totalSold: true,
    }
  })

  console.log(`Found ${products.length} products with rating > 0 or rx006:`)
  products.forEach(p => {
    console.log(`- [${p.slug}] "${p.name}": rating=${p.avgRating}, reviews=${p.reviewCount}, price=${p.basePrice}`)
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
