import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit } from '@/lib/redis'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const identifier = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`forgot_pw:${identifier}`, 3, 900)
    if (!limit.success) {
      return NextResponse.json(
        { message: 'Terlalu banyak permintaan reset password. Coba lagi 15 menit lagi.' },
        { status: 429 }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email harus diisi' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Return 200 even if user not found to prevent email enumeration
      return NextResponse.json(
        { message: 'Jika email terdaftar, tautan reset telah dikirim.' },
        { status: 200 }
      )
    }

    // Clean up existing tokens for this email first
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    }).catch(() => {})

    // Generate unique token
    const token = crypto.randomUUID()
    
    // Set expiry to 1 hour from now
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    // Save new token to database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    // Send email
    await sendPasswordResetEmail(email, resetLink)

    return NextResponse.json(
      { message: 'Tautan reset password telah dikirim ke email Anda.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
