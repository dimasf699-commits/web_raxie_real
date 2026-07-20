import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function createRedisClient() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err)
  })

  return client
}

export const redis =
  globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// ─── Cache helpers ─────────────────────────────────────────────────────────

export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  DAY: 86400,         // 24 hours
} as const

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (err) {
    console.error('[Redis] Set cache error:', err)
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (err) {
    console.error('[Redis] Delete cache error:', err)
  }
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (err) {
    console.error('[Redis] Delete pattern error:', err)
  }
}

// ─── Rate limiting ──────────────────────────────────────────────────────────

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `rl:${identifier}`
  const now = Date.now()
  const window = Math.floor(now / (windowSeconds * 1000))
  const windowKey = `${key}:${window}`

  try {
    const count = await redis.incr(windowKey)
    if (count === 1) {
      await redis.expire(windowKey, windowSeconds)
    }
    const remaining = Math.max(0, limit - count)
    return {
      success: count <= limit,
      remaining,
      reset: (window + 1) * windowSeconds * 1000,
    }
  } catch {
    // Fail open — don't block requests if Redis is down
    return { success: true, remaining: limit, reset: now + windowSeconds * 1000 }
  }
}
