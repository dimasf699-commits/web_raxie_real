import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const data = await resend.emails.send({
      from: 'Raxie <admin@raxie.my.id>',
      to: 'dimasf699@gmail.com',
      subject: 'Test Email Server',
      html: '<p>Ini adalah email pengetesan server.</p>'
    })
    
    return NextResponse.json({ success: true, data, message: "Cek email Anda sekarang!" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
