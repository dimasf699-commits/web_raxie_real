import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@/lib/auth'
import { rateLimit } from '@/lib/redis'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  try {
    // ── AUTH CHECK ────────────────────────────────────────────────────────────
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: Silakan login terlebih dahulu' }, { status: 401 })
    }

    // Rate Limiting: max 10 uploads per 10 minutes per user
    const limit = await rateLimit(`upload:${session.user.id}`, 10, 600)
    if (!limit.success) {
      return NextResponse.json({ error: 'Terlalu banyak upload. Coba lagi nanti.' }, { status: 429 })
    }
    // ─────────────────────────────────────────────────────────────────────────

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar (maksimal 5MB)' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Tipe file tidak didukung (hanya JPG, PNG, WEBP, dan PDF)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Verify magic bytes (file signature) to prevent MIME-type spoofing
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
    const isWebp = buffer.slice(0, 4).toString('utf-8') === 'RIFF' && buffer.slice(8, 12).toString('utf-8') === 'WEBP'
    const isPdf = buffer.slice(0, 4).toString('utf-8') === '%PDF'

    if (!isJpeg && !isPng && !isWebp && !isPdf) {
      return NextResponse.json(
        { error: 'Konten file tidak valid atau rusak (hanya format JPG, PNG, WEBP, dan PDF asli)' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary using a Promise
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'raxie' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({ url: (result as any).secure_url }, { status: 200 })
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
