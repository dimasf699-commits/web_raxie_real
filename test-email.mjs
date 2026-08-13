import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.titan.email',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function main() {
  console.log("⏳ Sedang mencoba terhubung ke server Titan Mail...");
  console.log("User:", process.env.SMTP_USER);
  
  if (!process.env.SMTP_PASSWORD) {
    console.log("❌ ERROR: Anda belum mengisi SMTP_PASSWORD di file .env lokal Anda!");
    return;
  }

  try {
    let info = await transporter.sendMail({
      from: `"Raxie Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test Koneksi SMTP Titan - Raxie",
      text: "Jika email ini masuk, berarti pengaturan SMTP Titan Anda SUDAH BENAR 100%.",
    });
    console.log("✅ BERHASIL! Email berhasil terkirim dengan ID:", info.messageId);
    console.log("Silakan cek kotak masuk email Titan Anda.");
  } catch (error) {
    console.error("\n❌ GAGAL MENGIRIM EMAIL! Berikut adalah pesan error aslinya dari Titan:\n");
    console.error(error.message);
    if (error.code === 'EAUTH') {
      console.log("\n💡 Kesimpulan: Ada yang salah dengan PASSWORD atau USERNAME email Titan Anda.");
    }
  }
}

main();
