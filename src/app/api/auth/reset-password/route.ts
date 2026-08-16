import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  try {
    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`reset_pw:${identifier}`, 5, 900) // 5x per 15 mins
    if (!limit.success) {
      return NextResponse.json(
        { message: 'Terlalu banyak percobaan reset password. Coba lagi 15 menit lagi.' },
        { status: 429 }
      )
    }

    const { token, email, password } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { message: 'Kata sandi minimal harus 8 karakter' },
        { status: 400 }
      )
    }

    // Find the token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Token tidak valid' },
        { status: 400 }
      )
    }

    // Check expiry
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          },
        },
      }).catch(() => {})
      return NextResponse.json(
        { message: 'Token sudah kedaluwarsa, silakan request ulang' },
        { status: 400 }
      )
    }

    // Hash new password with factor 12 (matching registration)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    }).catch(() => {})

    return NextResponse.json(
      { message: 'Kata sandi berhasil diubah' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
