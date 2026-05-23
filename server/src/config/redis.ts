import { Redis } from 'ioredis';
import { env } from './env.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('error', (err: any) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });
  }

  return redis;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  if (client.status === 'wait') {
    await client.connect();
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await getRedis().get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  await getRedis().del(key);
}
