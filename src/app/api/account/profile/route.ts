import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong').max(100, 'Nama terlalu panjang'),
  phone: z.string().max(20, 'Nomor HP tidak valid').optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: session.user.id
        ? { id: session.user.id }
        : { email: session.user.email! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[PROFILE_GET_ERROR]', error)
    return NextResponse.json({ error: 'Gagal memuat profil' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const userIdentifier = session.user.id
      ? { id: session.user.id }
      : { email: session.user.email! }

    const updatedUser = await prisma.user.update({
      where: userIdentifier as any,
      data: {
        name: parsed.data.name.trim(),
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone ? parsed.data.phone.trim() : null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('[PROFILE_UPDATE_ERROR]', error)
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 })
  }
}
