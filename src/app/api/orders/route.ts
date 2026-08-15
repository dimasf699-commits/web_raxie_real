import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimit } from '@/lib/redis'
import { generateOrderNumber } from '@/lib/utils'
import { resolveOrSyncDbUser } from '@/lib/auth-user'

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    variantId: z.string().optional(),
    name: z.string(),
    variantName: z.string().optional(),
    sku: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string(),
  })),
  shipping: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    detail: z.string(),
    areaId: z.string().optional(),
    postalCode: z.coerce.string().optional(),
    areaName: z.string().optional(),
  }),
  shippingCost: z.number(),
  courierName: z.string(),
  paymentMethod: z.string(),
  voucherId: z.string().optional(),
  discountAmount: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Rate Limiting: 5 orders per minute per user/IP
    const identifier = session?.user?.id || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'anonymous'
    const limit = await rateLimit(`order_create:${identifier}`, 5, 60)
    
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'X-RateLimit-Reset': limit.reset.toString() } }
      )
    }

    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      console.error('Validation error:', parsed.error.format())
      return NextResponse.json({ 
        error: 'Data pesanan tidak valid: ' + parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') 
      }, { status: 400 })
    }

    const data = parsed.data
    const subtotal = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const totalAmount = subtotal + data.shippingCost

    // Translate payment method to enum
    let paymentEnum: any = 'BANK_TRANSFER'
    if (data.paymentMethod === 'qris') paymentEnum = 'QRIS'
    if (data.paymentMethod === 'cc') paymentEnum = 'CREDIT_CARD'
    if (data.paymentMethod === 'bca' || data.paymentMethod === 'mandiri') paymentEnum = 'VIRTUAL_ACCOUNT'
    // Verify if user actually exists in DB (handles stale JWT session tokens if DB was reset)
    let validUserId = null
    if (session?.user) {
      const dbUser = await resolveOrSyncDbUser(session.user)
      if (dbUser) validUserId = dbUser.id
    }

    // Create Order and reduce stock in a single transaction with DB-verified prices
    const order = await prisma.$transaction(async (tx) => {
      // ── VALIDASI HARGA DARI DB & CEGAH OVERSELLING ───────────────────────
      let verifiedSubtotal = 0
      const verifiedItems = await Promise.all(
        data.items.map(async (item) => {
          // Multi-stage fallback lookup for ProductVariant
          let variant: any = null

          if (item.variantId) {
            variant = await tx.productVariant.findUnique({ 
              where: { id: item.variantId }, 
              include: { product: true } 
            })
          }

          if (!variant && item.sku) {
            variant = await tx.productVariant.findUnique({ 
              where: { sku: item.sku }, 
              include: { product: true } 
            })
          }

          if (!variant && item.productId) {
            variant = await tx.productVariant.findFirst({ 
              where: { productId: item.productId }, 
              include: { product: true } 
            })
          }

          if (!variant && item.id) {
            variant = await tx.productVariant.findFirst({
              where: { OR: [{ id: item.id }, { productId: item.id }] },
              include: { product: true }
            })
          }

          if (!variant) {
            const product = await tx.product.findFirst({
              where: { 
                OR: [
                  ...(item.productId ? [{ id: item.productId }] : []),
                  ...(item.id ? [{ id: item.id }] : []),
                  { name: { equals: item.name, mode: 'insensitive' } }
                ]
              },
              include: { variants: true }
            })

            if (product && product.variants.length > 0) {
              variant = { ...product.variants[0], product }
            }
          }

          if (!variant || !variant.product) {
            throw new Error(`Produk "${item.name}" tidak ditemukan`)
          }

          if (!variant.product.isActive || !variant.isActive) {
            throw new Error(`Produk "${variant.product.name}" sedang tidak aktif`)
          }

          if (variant.stock < item.quantity) {
            throw new Error(
              `Stok "${variant.product.name}" (${variant.name}) tidak cukup. Tersisa: ${variant.stock}, diminta: ${item.quantity}`
            )
          }

          const dbPrice = variant.price // HARGA ASLI DARI DATABASE
          const itemTotal = dbPrice * item.quantity
          verifiedSubtotal += itemTotal

          return {
            productId: variant.productId,
            variantId: variant.id,
            productName: variant.product.name,
            variantName: variant.name,
            sku: variant.sku,
            price: dbPrice,
            quantity: item.quantity,
            totalPrice: itemTotal,
            image: item.image || '/placeholder.jpg',
          }
        })
      )

      // ── VALIDASI VOUCHER SERVER-SIDE ──────────────────────────────────
      let calculatedDiscount = 0
      let validVoucherId: string | null = null

      if (data.voucherId) {
        const voucher = await tx.voucher.findUnique({
          where: { id: data.voucherId }
        })

        if (voucher && voucher.isActive) {
          const now = new Date()
          const isValidTime = (!voucher.startsAt || now >= voucher.startsAt) && (!voucher.expiresAt || now <= voucher.expiresAt)
          const isValidUsage = voucher.usageLimit === null || voucher.usageCount < voucher.usageLimit
          const isValidMinPurchase = verifiedSubtotal >= voucher.minPurchase

          let isPerUserValid = true
          if (validUserId && voucher.perUserLimit) {
            const userUsageCount = await tx.voucherUsage.count({
              where: { voucherId: voucher.id, userId: validUserId }
            })
            if (userUsageCount >= voucher.perUserLimit) {
              isPerUserValid = false
            }
          }

          if (isValidTime && isValidUsage && isValidMinPurchase && isPerUserValid) {
            validVoucherId = voucher.id
            if (voucher.type === 'PERCENTAGE') {
              calculatedDiscount = (verifiedSubtotal * voucher.value) / 100
              if (voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount) {
                calculatedDiscount = voucher.maxDiscount
              }
            } else if (voucher.type === 'FIXED_AMOUNT') {
              calculatedDiscount = voucher.value
            } else if (voucher.type === 'FREE_SHIPPING') {
              calculatedDiscount = Math.min(data.shippingCost, voucher.value)
            }

            // Increment voucher usage count atomically inside transaction
            await tx.voucher.update({
              where: { id: voucher.id },
              data: { usageCount: { increment: 1 } }
            })
          }
        }
      }

      const verifiedTotalAmount = Math.max(0, verifiedSubtotal + data.shippingCost - calculatedDiscount)
      // ───────────────────────────────────────────────────────────────────

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: validUserId,
          guestEmail: data.shipping.email,
          guestName: data.shipping.name,
          guestPhone: data.shipping.phone,
          shippingName: data.shipping.name,
          shippingPhone: data.shipping.phone,
          shippingStreet: data.shipping.detail,
          shippingCity: data.shipping.areaName || 'Jakarta', 
          shippingProvince: '', 
          shippingPostalCode: data.shipping.postalCode || '10000', 
          subtotal: verifiedSubtotal,
          shippingCost: data.shippingCost,
          discountAmount: calculatedDiscount,
          totalAmount: verifiedTotalAmount,
          paymentMethod: paymentEnum,
          courierName: data.courierName,
          voucherId: validVoucherId,
          status: 'PENDING_PAYMENT',
          items: {
            create: verifiedItems,
          }
        },
        include: {
          items: true,
        },
      })

      // Record voucher usage for authenticated user
      if (validVoucherId && validUserId) {
        await tx.voucherUsage.create({
          data: {
            voucherId: validVoucherId,
            userId: validUserId,
            orderId: newOrder.id,
          }
        })
      }

      // Atomic stock reduction to prevent race condition (overselling)
      for (const item of verifiedItems) {
        const updateRes = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity }
          },
          data: { stock: { decrement: item.quantity } }
        })

        if (updateRes.count === 0) {
          throw new Error(`Stok "${item.productName} (${item.variantName})" mendadak habis / tidak mencukupi`)
        }
      }

      return newOrder
    })


    // Midtrans Snap Token Request
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const snapApiUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    let snapToken = null

    if (midtransServerKey) {
      const authString = Buffer.from(midtransServerKey + ':').toString('base64')
      
      // Filter payment channels sesuai pilihan user
      // Kode production Midtrans: https://docs.midtrans.com/docs/snap-advanced-feature
      let enabled_payments: string[] | undefined = undefined
      if (data.paymentMethod === 'qris') {
        enabled_payments = ['qris', 'gopay', 'shopeepay', 'other_qris']
      } else if (data.paymentMethod === 'bca') {
        enabled_payments = ['bca_va']
      } else if (data.paymentMethod === 'mandiri') {
        enabled_payments = ['echannel'] // Mandiri Bill Payment
      } else if (data.paymentMethod === 'cc') {
        enabled_payments = ['credit_card']
      }

      const appUrl = process.env.NEXTAUTH_URL || 'https://raxie.id'

      const itemDetails: any[] = order.items.map((item: any) => ({
        id: item.sku || item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.productName.substring(0, 50),
      }))

      if (data.shippingCost > 0) {
        itemDetails.push({
          id: 'SHIPPING',
          price: Math.round(data.shippingCost),
          quantity: 1,
          name: 'Ongkos Kirim',
        })
      }

      if (order.discountAmount && order.discountAmount > 0) {
        itemDetails.push({
          id: 'DISCOUNT',
          price: -Math.round(order.discountAmount),
          quantity: 1,
          name: 'Diskon Voucher',
        })
      }

      const payload: any = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: Math.round(order.totalAmount),
        },
        customer_details: {
          first_name: data.shipping.name,
          email: customerEmail || 'customer@raxie.id',
          phone: data.shipping.phone,
        },
        item_details: itemDetails,
        callbacks: {
          notification: `${appUrl}/api/webhooks/midtrans`,
          finish: `${appUrl}/account/orders`,
          unfinish: `${appUrl}/checkout`,
          error: `${appUrl}/checkout`,
        },
        ...(enabled_payments ? { enabled_payments } : {})
      }

      const snapRes = await fetch(snapApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(payload)
      })

      const snapData = await snapRes.json()
      
      if (!snapRes.ok) {
        console.error('Midtrans Snap Error:', JSON.stringify(snapData))
        throw new Error(`Midtrans Error: ${snapData?.error_messages?.join(', ') || snapData?.message || JSON.stringify(snapData)}`)
      }
      
      snapToken = snapData.token
      
      if (snapToken) {
        await prisma.order.update({
          where: { id: order.id },
          data: { midtransToken: snapToken }
        })
      }
    }

    return NextResponse.json({ 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      snapToken 
    }, { status: 201 })
  } catch (error: any) {
    console.error('[ORDER_CREATE_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Gagal memproses pesanan' }, { status: 500 })
  }
}
