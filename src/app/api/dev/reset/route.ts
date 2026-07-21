import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Delete dependent records first to avoid foreign key constraints
    await prisma.loyaltyTransaction.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.wishlistItem.deleteMany()
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
    // Make orders anonymous instead of deleting them to avoid breaking order items cascade if any issues
    await prisma.order.updateMany({
      data: { userId: null }
    })
    
    // Now delete all users
    await prisma.user.deleteMany()
    
    return NextResponse.json({ message: 'All users have been deleted successfully.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
