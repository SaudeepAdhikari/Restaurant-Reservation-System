import logger from '../utils/logger.js';

const inMemoryCache = new Map();
let redisClient = null;
let redisEnabled = false;

export async function initCache() {
  if (!process.env.REDIS_URL) {
    logger.info('REDIS_URL not set. Using in-memory cache fallback.');
    return;
  }

  try {
    const redisPkg = await import('redis');
    redisClient = redisPkg.createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (error) => logger.error(`Redis error: ${error.message}`));
    await redisClient.connect();
    redisEnabled = true;
    logger.info('Redis cache connected');
  } catch (error) {
    redisEnabled = false;
    logger.warn(`Redis unavailable, fallback to memory cache: ${error.message}`);
  }
}

export async function getCache(key) {
  if (redisEnabled && redisClient) {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  const cacheItem = inMemoryCache.get(key);
  if (!cacheItem) return null;
  if (cacheItem.expiresAt < Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return cacheItem.value;
}

export async function setCache(key, value, ttlSeconds = 60) {
  if (redisEnabled && redisClient) {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return;
  }

  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

export async function invalidateByPrefix(prefix) {
  if (redisEnabled && redisClient) {
    const keys = await redisClient.keys(`${prefix}*`);
    if (keys.length) {
      await redisClient.del(keys);
    }
    return;
  }

  for (const key of inMemoryCache.keys()) {
    if (key.startsWith(prefix)) {
      inMemoryCache.delete(key);
    }
  }
}
