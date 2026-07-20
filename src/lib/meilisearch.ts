import { MeiliSearch } from 'meilisearch'

const globalForMeili = globalThis as unknown as {
  meilisearch: MeiliSearch | undefined
}

export const meilisearch =
  globalForMeili.meilisearch ??
  new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
  })

if (process.env.NODE_ENV !== 'production') globalForMeili.meilisearch = meilisearch

export const PRODUCT_INDEX = 'products'

/** Configure product index settings (run once at startup) */
export async function configureMeilisearch() {
  const index = meilisearch.index(PRODUCT_INDEX)

  await index.updateSettings({
    searchableAttributes: [
      'name',
      'shortDescription',
      'description',
      'tags',
      'category',
      'material',
    ],
    filterableAttributes: [
      'categoryId',
      'categorySlug',
      'isActive',
      'isFeatured',
      'isBestSeller',
      'isNew',
      'basePrice',
      'avgRating',
      'tags',
      'material',
    ],
    sortableAttributes: [
      'basePrice',
      'createdAt',
      'totalSold',
      'avgRating',
      'viewCount',
    ],
    displayedAttributes: [
      'id',
      'name',
      'slug',
      'shortDescription',
      'basePrice',
      'compareAtPrice',
      'categoryId',
      'categorySlug',
      'categoryName',
      'image',
      'avgRating',
      'reviewCount',
      'totalSold',
      'isFeatured',
      'isBestSeller',
      'isNew',
      'tags',
    ],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    pagination: { maxTotalHits: 1000 },
  })
}
