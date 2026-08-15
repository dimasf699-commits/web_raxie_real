import Redis from 'ioredis'

const url = process.env.REDIS_URL || 'redis://localhost:6379'
const client = new Redis(url)

async function main() {
  const keys = await client.keys('*')
  console.log(`Found ${keys.length} keys in Redis:`)
  for (const k of keys) {
    const val = await client.get(k)
    console.log(`- Key: ${k}`)
    console.log(`  Preview: ${val ? val.substring(0, 200) : ''}`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => client.disconnect())
