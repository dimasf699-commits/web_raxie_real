import { revalidatePath } from 'next/cache'
import { deleteCache, deleteCacheByPattern } from '@/lib/redis'

export interface InvalidateProductOptions {
  productId?: string
  slug?: string
}

/**
 * Unified Cache Invalidator for RAXIE
 * Purges Redis key-value cache and on-demand revalidates Next.js ISR pages.
 */
export async function invalidateProductCache(options?: InvalidateProductOptions): Promise<void> {
  try {
    const redisPurges: Promise<void>[] = [
      deleteCacheByPattern('api:products:*'),
      deleteCacheByPattern('products_list:*'),
      deleteCacheByPattern('homepage:*'),
    ]

    if (options?.productId) {
      redisPurges.push(deleteCache(`product_detail:${options.productId}`))
    }
    if (options?.slug) {
      redisPurges.push(deleteCache(`product_slug:${options.slug}`))
    }

    // Await Redis cache purging
    await Promise.allSettled(redisPurges)

    // Revalidate Next.js static edge pages
    try {
      revalidatePath('/', 'page')
      revalidatePath('/products', 'page')
      if (options?.slug) {
        revalidatePath(`/products/${options.slug}`, 'page')
      }
      revalidatePath('/products/[slug]', 'page')
    } catch (revalidateErr) {
      // revalidatePath may throw in non-request contexts, log safely
      console.warn('[REVALIDATE_PATH_WARNING]', revalidateErr)
    }
  } catch (err) {
    console.error('[CACHE_INVALIDATION_ERROR]', err)
  }
}
