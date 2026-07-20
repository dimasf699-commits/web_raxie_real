import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendOrderEmail } from '@/lib/email'

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
})

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `RXE-${date}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
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

    // Create Order with nested items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id || null,
        guestEmail: !session ? data.shipping.email : null,
        guestName: !session ? data.shipping.name : null,
        guestPhone: !session ? data.shipping.phone : null,
        shippingName: data.shipping.name,
        shippingPhone: data.shipping.phone,
        shippingStreet: data.shipping.detail,
        shippingCity: data.shipping.areaName || 'Jakarta', 
        shippingProvince: '', 
        shippingPostalCode: data.shipping.postalCode || '10000', 
        subtotal,
        shippingCost: data.shippingCost,
        totalAmount,
        paymentMethod: paymentEnum,
        courierName: data.courierName,
        status: 'PENDING_PAYMENT',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.name,
            variantName: item.variantName || null,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
            image: item.image,
          }))
        }
      },
    })

    // Reduce stock for each variant concurrently
    await Promise.all(
      data.items.map(item => {
        if (item.variantId) {
          return prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          }).catch(e => console.error('Failed to decrement stock:', e))
        } else {
          // If no variant, search for variant with matching SKU to reduce
          return prisma.productVariant.update({
            where: { sku: item.sku },
            data: { stock: { decrement: item.quantity } }
          }).catch(e => console.error('Failed to decrement stock by SKU:', e))
        }
      })
    )

    // Send order confirmation email asynchronously
    const customerEmail = session?.user?.email || data.shipping.email
    if (customerEmail) {
      sendOrderEmail(customerEmail, order.orderNumber, totalAmount).catch(console.error)
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
      
      const payload = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: Math.round(totalAmount),
        },
        customer_details: {
          first_name: data.shipping.name,
          email: customerEmail || 'customer@raxie.id',
          phone: data.shipping.phone,
        },
        item_details: data.items.map(item => ({
          id: item.sku,
          price: Math.round(item.price),
          quantity: item.quantity,
          name: item.name.substring(0, 50),
        })).concat(
          data.shippingCost > 0 ? [{
            id: 'SHIPPING',
            price: Math.round(data.shippingCost),
            quantity: 1,
            name: 'Ongkos Kirim',
          }] : []
        )
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
