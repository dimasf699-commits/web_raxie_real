import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.review.count();
  console.log('Total Reviews before delete:', count);
  
  await prisma.review.deleteMany();
  
  const countAfter = await prisma.review.count();
  console.log('Total Reviews after delete:', countAfter);
  
  console.log('Deleted all fake reviews.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
