import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.product.findFirst({ where: { name: { contains: 'RX006' } } });
  console.log('RX006 price:', p1?.basePrice, 'compareAtPrice:', p1?.compareAtPrice);
}

main().finally(() => prisma.$disconnect());
