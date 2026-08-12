import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await req.json()
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Tidak ada produk yang dipilih' }, { status: 400 })
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return NextResponse.json({ 
      message: `Berhasil menghapus ${result.count} produk`,
      success: true 
    })
  } catch (error: any) {
    console.error('Bulk Delete error:', error)
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 })
  }
}
