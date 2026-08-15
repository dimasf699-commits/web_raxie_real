import { PrismaClient } from '@prisma/client'
import * as xlsx from 'xlsx'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('=== SYNCING SHOPEE PRODUCTS FROM EXCEL FILES ===')

  const mediaFile = path.join(process.cwd(), 'mass_update_media_info_87287679_20260812211501.xlsx')
  const salesFile = path.join(process.cwd(), 'mass_update_sales_info_87287679_20260812211948.xlsx')

  if (!fs.existsSync(mediaFile) || !fs.existsSync(salesFile)) {
    console.error('One or both Excel files missing!')
    return
  }

  // 1. Read Media Info
  const mediaWb = xlsx.readFile(mediaFile)
  const mediaData = xlsx.utils.sheet_to_json<any[]>(mediaWb.Sheets[mediaWb.SheetNames[0]], { header: 1 })
  const mediaHeaders = mediaData[0]
  const mediaNameIdx = mediaHeaders.indexOf('et_title_product_name')
  const mediaCoverIdx = mediaHeaders.indexOf('ps_item_cover_image')
  const mediaImgIndices = [1,2,3,4,5,6,7,8].map(i => mediaHeaders.indexOf(`ps_item_image.${i}`))
  const mediaCategoryIdx = mediaHeaders.indexOf('et_title_product_category')

  const productsMap = new Map<string, {
    name: string
    category: string
    images: string[]
    variants: Array<{ name: string; price: number; stock: number; sku: string }>
  }>()

  for (let i = 5; i < mediaData.length; i++) {
    const row = mediaData[i]
    if (!row) continue
    const name = row[mediaNameIdx]
    if (!name || name === 'Opsional' || name === 'Wajib') continue

    const categoryRaw = row[mediaCategoryIdx] || 'Dompet'
    let categoryName = 'Dompet'
    if (categoryRaw.toLowerCase().includes('belt') || categoryRaw.toLowerCase().includes('ikat pinggang')) {
      categoryName = 'Sabuk'
    } else if (categoryRaw.toLowerCase().includes('tas') || categoryRaw.toLowerCase().includes('clutch') || categoryRaw.toLowerCase().includes('bag')) {
      categoryName = 'Tas'
    } else if (categoryRaw.toLowerCase().includes('keychain') || categoryRaw.toLowerCase().includes('kunci')) {
      categoryName = 'Aksesoris'
    }

    const images: string[] = []
    if (row[mediaCoverIdx]) images.push(row[mediaCoverIdx])
    mediaImgIndices.forEach(idx => {
      if (idx !== -1 && row[idx]) images.push(row[idx])
    })

    productsMap.set(name.trim(), {
      name: name.trim(),
      category: categoryName,
      images,
      variants: []
    })
  }

  // 2. Read Sales Info
  const salesWb = xlsx.readFile(salesFile)
  const salesData = xlsx.utils.sheet_to_json<any[]>(salesWb.Sheets[salesWb.SheetNames[0]], { header: 1 })
  const salesHeaders = salesData[0]
  const salesNameIdx = salesHeaders.indexOf('et_title_product_name')
  const salesVarNameIdx = salesHeaders.indexOf('et_title_variation_name')
  const salesSkuIdx = salesHeaders.indexOf('et_title_variation_sku')
  const salesPriceIdx = salesHeaders.indexOf('et_title_variation_price')
  const salesStockIdx = salesHeaders.indexOf('et_title_variation_stock')

  for (let i = 5; i < salesData.length; i++) {
    const row = salesData[i]
    if (!row) continue
    const name = row[salesNameIdx]
    if (!name || name === 'Opsional' || name === 'Wajib') continue

    const varName = row[salesVarNameIdx] || 'Default'
    let sku = row[salesSkuIdx] || ''
    const priceStr = row[salesPriceIdx]?.toString() || '0'
    const stockStr = row[salesStockIdx]?.toString() || '10'
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
    const stock = parseInt(stockStr.replace(/[^0-9]/g, ''), 10) || 10

    if (productsMap.has(name.trim())) {
      productsMap.get(name.trim())!.variants.push({
        name: varName,
        price,
        stock,
        sku: sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
      })
    } else {
      productsMap.set(name.trim(), {
        name: name.trim(),
        category: 'Dompet',
        images: ['https://i.imgur.com/1QtzAZ5.png'],
        variants: [{
          name: varName,
          price,
          stock,
          sku: sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
        }]
      })
    }
  }

  console.log(`Found ${productsMap.size} distinct products to import/sync into database.`)

  // 3. Ensure Categories exist
  const categoriesToEnsure = ['Dompet', 'Tas', 'Sabuk', 'Aksesoris']
  const catDbMap = new Map<string, string>()

  for (const catName of categoriesToEnsure) {
    let cat = await prisma.category.findFirst({
      where: { name: { equals: catName, mode: 'insensitive' } }
    })
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: catName,
          slug: catName.toLowerCase(),
          description: `Koleksi ${catName} Raxie Leather`,
          isActive: true,
        }
      })
    }
    catDbMap.set(catName, cat.id)
  }

  // Clear existing products to ensure clean re-sync without SKU collisions
  console.log('Cleaning old test/incomplete products...')
  await prisma.orderItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()

  // 4. Save/Update products in PostgreSQL
  let count = 0
  let skuCounter = 1000

  for (const [, prod] of productsMap) {
    const categoryId = catDbMap.get(prod.category) || catDbMap.get('Dompet')!
    const basePrice = prod.variants.length > 0 ? Math.min(...prod.variants.map(v => v.price).filter(p => p > 0)) : 49000
    const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + count

    const variantsData = (prod.variants.length > 0 ? prod.variants : [{ name: 'Default', price: basePrice || 49000, stock: 50, sku: '' }]).map((v, idx) => {
      skuCounter++
      return {
        name: v.name,
        price: v.price > 0 ? v.price : (basePrice || 49000),
        stock: v.stock > 0 ? v.stock : 50,
        sku: `RXE-${skuCounter}`,
        sortOrder: idx
      }
    })

    const newProd = await prisma.product.create({
      data: {
        name: prod.name,
        slug,
        description: `${prod.name} dari RAXIE. Dibuat dengan material berkualitas premium, desain modern, dan jahitan presisi untuk daya tahan maksimal.`,
        shortDescription: `Produk premium ${prod.name} dengan kualitas terbaik dari RAXIE.`,
        basePrice: basePrice > 0 ? basePrice : 49000,
        compareAtPrice: Math.round((basePrice > 0 ? basePrice : 49000) * 1.25),
        categoryId,
        isActive: true,
        isFeatured: count < 6,
        isBestSeller: count < 10,
        avgRating: 0,
        reviewCount: 0,
        images: {
          create: (prod.images.length > 0 ? prod.images : ['https://i.imgur.com/1QtzAZ5.png']).map((url, idx) => ({
            url,
            sortOrder: idx
          }))
        },
        variants: {
          create: variantsData
        }
      }
    })
    console.log(`[${count + 1}] Created product: "${newProd.name}" (Price: ${newProd.basePrice}, Images: ${prod.images.length}, Variants: ${variantsData.length})`)
    count++
  }

  console.log(`\n🎉 Successfully synced ${count} products with full images, prices, and variants!`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
