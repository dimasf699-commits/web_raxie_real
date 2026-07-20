import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // 1. Check if user exists
    const email = 'dimasf699@gmail.com'
    const user = await prisma.user.findUnique({ where: { email } })
    
    // 2. Test sending email directly
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Test Email Raxie',
      html: '<p>This is a test email.</p>'
    })

    return NextResponse.json({
      userExists: !!user,
      userObj: user,
      emailSent: data,
      apiKeyLength: process.env.RESEND_API_KEY?.length
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
