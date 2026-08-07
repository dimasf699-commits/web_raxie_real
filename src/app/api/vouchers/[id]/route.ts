import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id: params.id },
    })

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(voucher)
  } catch (error) {
    console.error('[VOUCHER_GET_DETAIL_ERROR]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 })
    }

    const body = await req.json()
    const { code, name, type, value, minPurchase, usageLimit, expiresAt, isActive } = body

    const updateData: any = {}

    if (code !== undefined) updateData.code = code.toUpperCase().trim()
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (value !== undefined) updateData.value = Number(value)
    if (minPurchase !== undefined) updateData.minPurchase = Number(minPurchase)
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? Number(usageLimit) : null
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    if (expiresAt !== undefined) {
      if (expiresAt) {
        const parsedDate = new Date(expiresAt)
        updateData.expiresAt = !isNaN(parsedDate.getTime()) ? parsedDate : null
      } else {
        updateData.expiresAt = null
      }
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedVoucher)
  } catch (error: any) {
    console.error('[VOUCHER_PATCH_ERROR]', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Kode voucher sudah digunakan' }, { status: 400 })
    }
    return NextResponse.json({ message: error.message || 'Gagal memperbarui voucher' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 })
    }

    await prisma.voucher.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Voucher berhasil dihapus' })
  } catch (error: any) {
    console.error('[VOUCHER_DELETE_ERROR]', error)
    return NextResponse.json({ message: error.message || 'Gagal menghapus voucher' }, { status: 500 })
  }
}
