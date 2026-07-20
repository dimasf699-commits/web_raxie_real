import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
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

    // Generate unique token
    const token = crypto.randomUUID()
    
    // Set expiry to 1 hour from now
    const expires = new Date()
    expires.setHours(expires.getHours() + 1)

    // Save token to database
    // We use upsert so if they request multiple times, we just update the token
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
      update: {
        token,
        expires,
      },
      create: {
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
