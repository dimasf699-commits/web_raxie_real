import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'onboarding@resend.dev' // Default for Resend free tier without verified domain

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Skipping welcome email.')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Selamat Datang di Raxie! 🎉',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #a18a66;">Selamat Datang, ${name}!</h1>
          <p>Terima kasih telah bergabung dengan Raxie. Kami sangat senang bisa menjadi bagian dari perjalanan gaya Anda.</p>
          <p>Sebagai ucapan terima kasih, kami telah menambahkan <strong>100 Poin Loyalitas</strong> ke akun Anda yang bisa digunakan untuk diskon belanja selanjutnya!</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/products" style="background-color: #a18a66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Mulai Belanja</a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">© ${new Date().getFullYear()} Raxie. All rights reserved.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export const sendOrderEmail = async (email: string, orderNumber: string, total: number) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Skipping order email.')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Pesanan Diterima - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #a18a66;">Pesanan Anda Sedang Diproses</h1>
          <p>Terima kasih telah berbelanja di Raxie!</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Nomor Pesanan:</strong> ${orderNumber}</p>
            <p style="margin: 0;"><strong>Total Pembayaran:</strong> Rp${total.toLocaleString('id-ID')}</p>
          </div>
          <p>Kami akan mengirimkan email notifikasi berikutnya beserta resi ketika pesanan Anda sudah dikirim.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/account/orders" style="background-color: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Lacak Pesanan</a>
          </div>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send order email:', error)
  }
}

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Skipping reset email.')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Atur Ulang Kata Sandi Raxie Anda',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #a18a66;">Atur Ulang Kata Sandi</h1>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Raxie Anda.</p>
          <p>Klik tombol di bawah ini untuk membuat kata sandi baru. Tautan ini hanya berlaku selama 1 jam.</p>
          <div style="margin-top: 30px; margin-bottom: 30px; text-align: center;">
            <a href="${resetLink}" style="background-color: #a18a66; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Atur Ulang Kata Sandi</a>
          </div>
          <p>Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini. Akun Anda tetap aman.</p>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">© ${new Date().getFullYear()} Raxie. All rights reserved.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send reset password email:', error)
  }
}

export const sendShippingEmail = async (email: string, orderNumber: string, trackingNumber: string, courierName: string) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Skipping shipping email.')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Pesanan Anda Telah Dikirim! - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #a18a66;">Yeay, Paket Anda Sedang Meluncur! 🚀</h1>
          <p>Kabar gembira! Pesanan Anda dengan nomor <strong>${orderNumber}</strong> telah diserahkan ke pihak kurir pengiriman.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Jasa Pengiriman:</strong> ${courierName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Nomor Resi:</strong> ${trackingNumber}</p>
            <p style="margin: 0; font-size: 14px; color: #666;">Silakan gunakan nomor resi di atas untuk melacak posisi paket Anda di website kurir terkait.</p>
          </div>
          <p>Mohon pastikan nomor ponsel yang Anda masukkan aktif agar kurir mudah menghubungi Anda saat pengiriman paket.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/account/orders" style="background-color: #111; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Cek Pesanan Saya</a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">© ${new Date().getFullYear()} Raxie. All rights reserved.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send shipping email:', error)
  }
}
