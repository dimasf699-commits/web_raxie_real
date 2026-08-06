import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('[ADDRESSES_GET_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengambil daftar alamat' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { label, recipientName, phone, street, district, city, province, postalCode, areaId, isDefault } = body

    if (!recipientName || !phone || !street) {
      return NextResponse.json({ error: 'Nama penerima, nomor HP, dan alamat lengkap wajib diisi' }, { status: 400 })
    }

    // If setting as default, unset other default addresses for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        label: label || 'Rumah',
        recipientName,
        phone,
        street,
        district: district || '',
        city: city || '',
        province: province || '',
        postalCode: postalCode || '',
        areaId,
        isDefault: !!isDefault,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error('[ADDRESSES_POST_ERROR]', error)
    return NextResponse.json({ error: 'Gagal menyimpan alamat' }, { status: 500 })
  }
}
