import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redis: Redis | null = null;
let isRedisAvailable = false;

try {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      // Limit retries to prevent request hanging when Redis is offline
      if (times > 2) {
        isRedisAvailable = false;
        console.warn(`[REDIS] Connection failed after ${times} attempts. Disabling cache and falling back to database.`);
        return null; // Stop retrying
      }
      return 1000; // Retry after 1 second
    }
  });

  redis.on('connect', () => {
    console.log(`[REDIS] Connecting to Redis at ${REDIS_URL}...`);
  });

  redis.on('ready', () => {
    isRedisAvailable = true;
    console.log('[REDIS] 🟢 Redis Client Ready');
  });

  redis.on('error', (err) => {
    isRedisAvailable = false;
    console.error('[REDIS] 🔴 Redis Client Connection Error:', err.message);
  });

  redis.on('close', () => {
    isRedisAvailable = false;
    console.log('[REDIS] Redis Connection Closed');
  });
} catch (error: any) {
  console.error('[REDIS] 🔴 Failed to initialize Redis Client:', error.message);
}

export const redisClient = {
  async get(key: string): Promise<string | null> {
    if (!isRedisAvailable || !redis) return null;
    try {
      const start = Date.now();
      const value = await redis.get(key);
      const duration = Date.now() - start;
      if (value) {
        console.log(`[REDIS] 🟢 Cache Hit for "${key}" - Returned in ${duration}ms`);
      } else {
        console.log(`[REDIS] 🔴 Cache Miss for "${key}"`);
      }
      return value;
    } catch (err: any) {
      console.warn(`[REDIS] Error reading key "${key}":`, err.message);
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    if (!isRedisAvailable || !redis) return;
    try {
      await redis.set(key, value, 'EX', ttlSeconds);
      console.log(`[REDIS] 💾 Cached key "${key}" with TTL of ${ttlSeconds}s`);
    } catch (err: any) {
      console.warn(`[REDIS] Error writing key "${key}":`, err.message);
    }
  },

  async del(key: string): Promise<void> {
    if (!isRedisAvailable || !redis) return;
    try {
      await redis.del(key);
      console.log(`[REDIS] ⚡ Invalidated cache key "${key}"`);
    } catch (err: any) {
      console.warn(`[REDIS] Error deleting key "${key}":`, err.message);
    }
  }
};
