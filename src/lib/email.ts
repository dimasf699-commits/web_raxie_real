import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD,
  },
})

const FROM_EMAIL = `"Raxie" <${process.env.SMTP_USER || 'admin@raxie.id'}>`

export const sendWelcomeEmail = async (email: string, name: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not found. Skipping welcome email.')
    return
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Selamat Datang di Raxie! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not found. Skipping order email.')
    return
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Pesanan Diterima - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
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
          <p style="margin-top: 40px; font-size: 12px; color: #666;">© ${new Date().getFullYear()} Raxie. All rights reserved.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send order email:', error)
  }
}

export const sendShippingEmail = async (email: string, orderNumber: string, courierName: string, trackingNumber: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not found. Skipping shipping email.')
    return
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Pesanan Anda Telah Dikirim! - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
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

export const sendContactFormEmail = async (name: string, email: string, message: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not found. Skipping contact email.')
    return
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: process.env.SMTP_USER, // Mengirim ke email admin itu sendiri
      subject: `📩 Pesan Baru dari Website RAXIE - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #C19A6B;">Pesan Kontak Baru dari Website RAXIE</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Nama Pengirim:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email Pengirim:</strong> ${email}</p>
            <p style="margin: 0 0 5px 0;"><strong>Isi Pesan:</strong></p>
            <div style="background-color: #ffffff; border: 1px solid #ddd; padding: 12px; border-radius: 8px; font-style: italic;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
          <p style="font-size: 12px; color: #666;">Pesan ini dikirimkan melalui formulir Hubungi Kami di raxie.id</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send contact email:', error)
  }
}

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not found. Skipping password reset email.')
    return
  }

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Password Akun RAXIE Anda 🔐',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #C19A6B;">Permintaan Reset Password</h2>
          <p>Kami menerima permintaan untuk mereset password akun RAXIE Anda.</p>
          <p>Silakan klik tombol di bawah ini untuk membuat password baru Anda (berlaku selama 1 jam):</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #C19A6B; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password Saya</a>
          </div>
          <p style="font-size: 12px; color: #666;">Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini.</p>
          <p style="margin-top: 40px; font-size: 12px; color: #666;">© ${new Date().getFullYear()} RAXIE. All rights reserved.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }
}
