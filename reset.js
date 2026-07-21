const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDB() {
  try {
    await prisma.loyaltyTransaction.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.order.updateMany({ data: { userId: null } });
    await prisma.user.deleteMany();
    console.log('All users have been deleted successfully!');
  } catch (err) {
    console.error('Failed to reset DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetDB();
