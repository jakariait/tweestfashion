const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client
  .connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Redis connection failed:', err));

/**
 * Delete every cache entry whose key matches a glob pattern.
 * Used because cached GET keys may include query strings
 * (e.g. '/api/products?page=2') that a plain del() would miss.
 */
const clearCachePattern = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Cleared ${keys.length} cache keys for pattern: ${pattern}`);
    }
  } catch (err) {
    console.error('Redis clearCachePattern error:', err);
  }
};

module.exports = { client, clearCachePattern };
