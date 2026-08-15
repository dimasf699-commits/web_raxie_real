import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.storeSetting.findMany()
    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('[SETTINGS_GET]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('[SETTINGS_POST]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
