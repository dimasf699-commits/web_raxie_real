import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrSyncDbUser } from '@/lib/auth-user'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await resolveOrSyncDbUser(session.user)
    if (!dbUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    const addressId = params.id
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: dbUser.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Alamat tidak ditemukan atau bukan milik Anda' }, { status: 404 })
    }

    const body = await req.json()
    const { label, recipientName, phone, street, district, city, province, postalCode, areaId, isDefault } = body

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: dbUser.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: label !== undefined ? String(label) : existing.label,
        recipientName: recipientName !== undefined ? String(recipientName) : existing.recipientName,
        phone: phone !== undefined ? String(phone) : existing.phone,
        street: street !== undefined ? String(street) : existing.street,
        district: district !== undefined ? String(district) : existing.district,
        city: city !== undefined ? String(city) : existing.city,
        province: province !== undefined ? String(province) : existing.province,
        postalCode: postalCode !== undefined ? String(postalCode) : existing.postalCode,
        areaId: areaId !== undefined ? (areaId ? String(areaId) : null) : existing.areaId,
        isDefault: isDefault !== undefined ? !!isDefault : existing.isDefault,
      },
    })

    return NextResponse.json({ success: true, address: updated })
  } catch (error: any) {
    console.error('[ADDRESS_PUT_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal memperbarui alamat' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await resolveOrSyncDbUser(session.user)
    if (!dbUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    const addressId = params.id
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: dbUser.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Alamat tidak ditemukan atau bukan milik Anda' }, { status: 404 })
    }

    await prisma.address.delete({
      where: { id: addressId },
    })

    return NextResponse.json({ success: true, message: 'Alamat berhasil dihapus' })
  } catch (error: any) {
    console.error('[ADDRESS_DELETE_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal menghapus alamat' }, { status: 500 })
  }
}
