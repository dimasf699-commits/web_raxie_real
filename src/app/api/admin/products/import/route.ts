import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as xlsx from 'xlsx'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ message: 'File tidak ditemukan' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = xlsx.read(Buffer.from(buffer), { type: 'buffer' })
    
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
    
    // Log the first few rows so we can inspect the headers
    console.log("Shopee Excel Headers:", rawData.slice(0, 5))
    
    // TODO: Map the Shopee Excel rows to Prisma products once we confirm the headers
    
    return NextResponse.json({ 
      message: 'File berhasil diunggah. Kami sedang menganalisis strukturnya.',
      success: true 
    })
  } catch (error: any) {
    console.error('Import POST error:', error)
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 })
  }
}
