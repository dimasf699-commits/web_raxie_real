import { deleteCacheByPattern, redis } from './src/lib/redis';

async function main() {
  console.log('Flushing Redis cache for products...');
  await deleteCacheByPattern('api:products:*');
  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => redis.disconnect());
