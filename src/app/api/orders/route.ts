import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendOrderEmail } from '@/lib/email'
import { rateLimit } from '@/lib/redis'

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

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `RXE-${date}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    // Rate Limiting: 5 orders per minute per user/IP
    const identifier = session?.user?.id || req.ip || 'anonymous'
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
    if (session?.user?.id) {
      const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (dbUser) validUserId = dbUser.id
    }

    // Create Order and reduce stock in a single transaction with DB-verified prices
    const order = await prisma.$transaction(async (tx) => {
      // ── VALIDASI HARGA DARI DB & CEGAH OVERSELLING ───────────────────────
      let verifiedSubtotal = 0
      const verifiedItems = await Promise.all(
        data.items.map(async (item) => {
          const variant = item.variantId
            ? await tx.productVariant.findUnique({ 
                where: { id: item.variantId }, 
                include: { product: true } 
              })
            : await tx.productVariant.findUnique({ 
                where: { sku: item.sku }, 
                include: { product: true } 
              })

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

      const verifiedTotalAmount = Math.max(0, verifiedSubtotal + data.shippingCost - (data.discountAmount || 0))
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
          totalAmount: verifiedTotalAmount,
          paymentMethod: paymentEnum,
          courierName: data.courierName,
          voucherId: data.voucherId || null,
          status: 'PENDING_PAYMENT',
          items: {
            create: verifiedItems,
          }
        },
      })

      // Reduce stock for each variant concurrently
      await Promise.all(
        verifiedItems.map(item => {
          return tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          })
        })
      )

      return newOrder
    })


    // Send order confirmation email asynchronously
    const customerEmail = session?.user?.email || data.shipping.email
    if (customerEmail) {
      sendOrderEmail(customerEmail, order.orderNumber, order.totalAmount).catch(console.error)
    }

    // Midtrans Snap Token Request
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    const snapApiUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

    let snapToken = null

    if (midtransServerKey) {
      console.log('[MIDTRANS] Using key prefix:', midtransServerKey.substring(0, 20), '| isProduction:', isProduction)
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

      const appUrl = 'https://raxie.my.id'

      const itemDetails: any[] = data.items.map(item => ({
        id: item.sku,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      }))

      if (data.shippingCost > 0) {
        itemDetails.push({
          id: 'SHIPPING',
          price: Math.round(data.shippingCost),
          quantity: 1,
          name: 'Ongkos Kirim',
        })
      }

      if (data.discountAmount && data.discountAmount > 0) {
        itemDetails.push({
          id: 'DISCOUNT',
          price: -Math.round(data.discountAmount),
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
