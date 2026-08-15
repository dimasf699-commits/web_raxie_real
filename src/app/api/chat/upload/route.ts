import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
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
    // Rate Limiting: 10 uploads per 10 minutes per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`chat_upload:${clientIp}`, 10, 600)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Batas upload terlampaui. Silakan tunggu beberapa saat.' },
        { status: 429 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimal 5 MB' }, { status: 400 })
    }

    const mimeType = file.type.toLowerCase()
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap unggah gambar (JPG, PNG, WEBP) atau file PDF.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Magic bytes validation
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
    const isWebp = buffer.slice(0, 4).toString('utf-8') === 'RIFF' && buffer.slice(8, 12).toString('utf-8') === 'WEBP'
    const isPdf = buffer.slice(0, 4).toString('utf-8') === '%PDF'

    if (!isJpeg && !isPng && !isWebp && !isPdf) {
      return NextResponse.json(
        { error: 'Konten file tidak valid atau rusak (hanya format JPG, PNG, WEBP, dan PDF asli yang diizinkan).' },
        { status: 400 }
      )
    }

    const isImage = isJpeg || isPng || isWebp
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 80)

    // Upload to Cloudinary remote storage
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'raxie/chat_attachments',
          resource_type: isPdf ? 'raw' : 'image',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as any)
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      fileName: sanitizedFileName,
      fileType: isImage ? 'IMAGE' : 'FILE',
      mimeType,
    })
  } catch (error) {
    console.error('[CHAT_UPLOAD_ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengunggah file. Silakan coba lagi.' }, { status: 500 })
  }
}
