import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === '1'

    if (isAdmin) {
      const session = await auth()
      if (!session || (session.user as any)?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const vouchers = await prisma.voucher.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(vouchers)
  } catch (error) {
    console.error('[VOUCHERS_GET_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengambil data voucher' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Akses khusus Admin' }, { status: 401 })
    }

    const body = await req.json()
    const { code, name, type, value, minPurchase, usageLimit, expiresAt } = body

    if (!code || !name || value === undefined || isNaN(Number(value))) {
      return NextResponse.json({ error: 'Kode, nama, dan nilai voucher wajib diisi' }, { status: 400 })
    }

    // Safely parse expiresAt date
    let validExpiresAt: Date | null = null
    if (expiresAt) {
      const parsedDate = new Date(expiresAt)
      if (!isNaN(parsedDate.getTime())) {
        validExpiresAt = parsedDate
      }
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase().trim(),
        name,
        type: type || 'PERCENTAGE',
        value: Number(value),
        minPurchase: minPurchase ? Number(minPurchase) : 0,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: validExpiresAt,
        isActive: true,
      },
    })

    return NextResponse.json(voucher, { status: 201 })
  } catch (error: any) {
    console.error('[VOUCHERS_POST_ERROR]', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Kode voucher sudah digunakan' }, { status: 400 })
    }
    return NextResponse.json({ message: error.message || 'Gagal membuat voucher' }, { status: 500 })
  }
}
