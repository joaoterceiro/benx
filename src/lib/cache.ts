import Redis from "ioredis";
import { logger } from "@/lib/logger";

const url = process.env.REDIS_URL ?? "redis://localhost:6379";

// Reaproveita a conexão entre hot reloads em dev.
const globalForRedis = globalThis as unknown as { _benxRedis?: Redis };
export const redis =
  globalForRedis._benxRedis ??
  new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
if (process.env.NODE_ENV !== "production") globalForRedis._benxRedis = redis;

// Leitura tipada do cache. Retorna null em miss ou erro (cache nunca derruba a request).
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    logger.warn({ err, action: "cache_get", key }, "falha ao ler do cache");
    return null;
  }
}

// Escrita com TTL em segundos (default 5 min).
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.warn({ err, action: "cache_set", key }, "falha ao escrever no cache");
  }
}

// Invalida todas as chaves de um prefixo (ex.: "busca:vivabenx:"). Usar no write.
export async function cacheInvalidate(prefix: string): Promise<void> {
  try {
    const stream = redis.scanStream({ match: `${prefix}*`, count: 100 });
    const pipeline = redis.pipeline();
    for await (const keys of stream) {
      for (const k of keys as string[]) pipeline.del(k);
    }
    await pipeline.exec();
  } catch (err) {
    logger.warn({ err, action: "cache_invalidate", prefix }, "falha ao invalidar cache");
  }
}
