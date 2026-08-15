import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

const prisma = new PrismaClient()

async function main() {
  console.log('Resetting fake ratings and review counts across all products in database...')

  const result = await prisma.product.updateMany({
    data: {
      avgRating: 0,
      reviewCount: 0,
    }
  })

  console.log(`✅ Successfully updated ${result.count} products to 0 rating & 0 reviews.`)

  // Invalidate Redis cache
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    const redis = new Redis(redisUrl)
    const stream = redis.scanStream({ match: 'api:products:*', count: 100 })
    let keysDeleted = 0
    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        const pipeline = redis.pipeline()
        keys.forEach(k => pipeline.del(k))
        await pipeline.exec()
        keysDeleted += keys.length
      }
    })
    stream.on('end', () => {
      console.log(`✅ Redis cache cleared (${keysDeleted} keys).`)
      redis.disconnect()
    })
  } catch (err) {
    console.log('Redis cache clear skipped/error:', err)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
