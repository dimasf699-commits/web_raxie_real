import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    // In a real app, verify admin role here
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { trackingNumber, courierName } = await req.json()

    if (!trackingNumber) {
      return NextResponse.json({ error: 'Tracking number is required' }, { status: 400 })
    }

    const orderId = params.id

    // Update order status to SHIPPED and add tracking number
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber,
        courierName: courierName || undefined,
        status: 'SHIPPED',
        shippedAt: new Date(),
        // Automatically add a tracking history entry
        trackingHistory: {
          create: {
            status: 'SHIPPED',
            description: `Pesanan telah dikirim dengan nomor resi ${trackingNumber}`,
            location: 'Fasilitas Logistik Raxie',
            createdBy: session.user.id
          }
        }
      }
    })

    return NextResponse.json({ message: 'Tracking updated successfully', order: updatedOrder }, { status: 200 })
  } catch (error) {
    console.error('[TRACKING_UPDATE_ERROR]', error)
    return NextResponse.json({ error: 'Failed to update tracking' }, { status: 500 })
  }
}
