import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrSyncDbUser } from '@/lib/auth-user'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await resolveOrSyncDbUser(session.user)
    if (!dbUser) {
      return NextResponse.json({ addresses: [] })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: dbUser.id },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 })
    }

    const dbUser = await resolveOrSyncDbUser(session.user)
    if (!dbUser) {
      return NextResponse.json({ error: 'Gagal memverifikasi akun pengguna' }, { status: 400 })
    }

    const body = await req.json()
    const { label, recipientName, phone, street, district, city, province, postalCode, areaId, isDefault } = body

    if (!recipientName || !phone || !street) {
      return NextResponse.json({ error: 'Nama penerima, nomor HP, dan alamat lengkap wajib diisi' }, { status: 400 })
    }

    // If setting as default, unset other default addresses for this user
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: dbUser.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: dbUser.id,
        label: String(label || 'Rumah'),
        recipientName: String(recipientName),
        phone: String(phone),
        street: String(street),
        district: String(district || ''),
        city: String(city || ''),
        province: String(province || ''),
        postalCode: String(postalCode ?? ''),
        areaId: areaId ? String(areaId) : null,
        isDefault: !!isDefault,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error: any) {
    console.error('[ADDRESSES_POST_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal menyimpan alamat' }, { status: 500 })
  }
}
