import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteCacheByPattern } from '@/lib/redis'
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
    
    const rawData = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 })
    if (rawData.length < 5) {
      return NextResponse.json({ message: 'File Excel tidak valid atau kosong' }, { status: 400 })
    }

    const headerKeys = rawData[0]
    const isMediaInfo = headerKeys.includes('ps_item_cover_image')
    const isSalesInfo = headerKeys.includes('et_title_variation_price')

    if (!isMediaInfo && !isSalesInfo) {
      return NextResponse.json({ message: 'Format file tidak dikenali. Pastikan file adalah Informasi Dasar atau Informasi Penjualan.' }, { status: 400 })
    }

    // Pastikan ada default category
    let defaultCategory = await prisma.category.findFirst({ where: { name: 'Dompet' } })
    if (!defaultCategory) {
      defaultCategory = await prisma.category.findFirst()
      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: { name: 'Dompet', slug: 'dompet', description: 'Koleksi Dompet Raxie' }
        })
      }
    }

    let processedCount = 0

    if (isMediaInfo) {
      const nameIdx = headerKeys.indexOf('et_title_product_name')
      const coverIdx = headerKeys.indexOf('ps_item_cover_image')
      const imgIndices = [1,2,3,4,5,6,7,8].map(i => headerKeys.indexOf(`ps_item_image.${i}`))
      
      for (let i = 5; i < rawData.length; i++) {
        const row = rawData[i]
        if (!row) continue
        const name = row[nameIdx]
        
        if (!name || name === 'Opsional' || name === 'Wajib') continue
        
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000)
        
        const images: string[] = []
        if (row[coverIdx] && typeof row[coverIdx] === 'string' && row[coverIdx].startsWith('http')) {
          images.push(row[coverIdx])
        }
        imgIndices.forEach(idx => {
          if (idx !== -1 && row[idx] && typeof row[idx] === 'string' && row[idx].startsWith('http')) {
            images.push(row[idx])
          }
        })

        if (images.length === 0) continue

        // Update or create product
        const existing = await prisma.product.findFirst({ where: { name: name.trim() } })
        if (existing) {
          await prisma.productImage.deleteMany({ where: { productId: existing.id } })
          await prisma.productImage.createMany({
            data: images.map((url, index) => ({
              productId: existing.id,
              url,
              sortOrder: index
            }))
          })
          processedCount++
        } else {
          // Create product with default variant
          const skuCode = `RXE-IMP-${Date.now()}-${i}`
          await prisma.product.create({
            data: {
              name: name.trim(),
              slug,
              description: `${name.trim()} - Produk premium dari RAXIE.`,
              shortDescription: `Produk premium dari RAXIE.`,
              basePrice: 49000,
              compareAtPrice: 65000,
              categoryId: defaultCategory.id,
              images: {
                create: images.map((url, index) => ({ url, sortOrder: index }))
              },
              variants: {
                create: [
                  {
                    name: 'Default',
                    price: 49000,
                    stock: 50,
                    sku: skuCode,
                    sortOrder: 0
                  }
                ]
              }
            }
          })
          processedCount++
        }
      }
    } else if (isSalesInfo) {
      const nameIdx = headerKeys.indexOf('et_title_product_name')
      const varNameIdx = headerKeys.indexOf('et_title_variation_name')
      const varSkuIdx = headerKeys.indexOf('et_title_variation_sku')
      const priceIdx = headerKeys.indexOf('et_title_variation_price')
      const stockIdx = headerKeys.indexOf('et_title_variation_stock')
      
      for (let i = 5; i < rawData.length; i++) {
        const row = rawData[i]
        if (!row) continue
        const name = row[nameIdx]
        
        if (!name || name === 'Opsional' || name === 'Wajib') continue
        
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000)
        const varName = row[varNameIdx] || 'Default'
        let sku = row[varSkuIdx] || ''
        if (!sku || sku.trim() === '') {
          sku = `RXE-VAR-${Date.now()}-${i}`
        }
        
        const priceStr = row[priceIdx]?.toString() || '0'
        const stockStr = row[stockIdx]?.toString() || '0'
        
        const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 49000
        const stock = parseInt(stockStr.replace(/[^0-9]/g, ''), 10) || 50

        // Find or create product
        let product = await prisma.product.findFirst({ where: { name: name.trim() } })
        if (!product) {
          product = await prisma.product.create({
            data: {
              name: name.trim(),
              slug,
              description: `${name.trim()} - Produk premium dari RAXIE.`,
              shortDescription: `Produk premium dari RAXIE.`,
              basePrice: price,
              compareAtPrice: Math.round(price * 1.25),
              categoryId: defaultCategory.id,
              images: {
                create: [{ url: 'https://i.imgur.com/1QtzAZ5.png', sortOrder: 0 }]
              }
            }
          })
        } else {
          // Update base price
          if (product.basePrice === 0 || price < product.basePrice) {
            await prisma.product.update({
              where: { id: product.id },
              data: {
                basePrice: price,
                compareAtPrice: Math.round(price * 1.25)
              }
            })
          }
        }

        // Check if variant exists
        const existingVar = await prisma.productVariant.findFirst({
          where: { productId: product.id, name: varName }
        })

        if (existingVar) {
          await prisma.productVariant.update({
            where: { id: existingVar.id },
            data: { price, stock, sku: existingVar.sku || sku }
          })
        } else {
          // Check if SKU already exists globally
          const skuConflict = await prisma.productVariant.findUnique({ where: { sku } })
          const finalSku = skuConflict ? `RXE-${Date.now()}-${i}` : sku

          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: varName,
              price,
              stock,
              sku: finalSku,
              sortOrder: 0
            }
          })
        }
        processedCount++
      }
    }

    // Invalidate product public cache
    await deleteCacheByPattern('api:products:*')
    
    return NextResponse.json({ 
      message: `Berhasil memproses ${processedCount} data dari file ${isMediaInfo ? 'Informasi Media' : 'Informasi Penjualan'}.`,
      success: true 
    })
  } catch (error: any) {
    console.error('Import POST error:', error)
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 })
  }
}
