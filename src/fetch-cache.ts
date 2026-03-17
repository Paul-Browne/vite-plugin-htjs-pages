import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CACHE_DIR_NAME } from './constants';

export interface FetchAndCacheOptions {
  maxAge?: number;
  cacheKey?: string;
  forceRefresh?: boolean;
}

type CachedResponseRecord = {
  timestamp: number;
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
};

function createDefaultCacheKey(
  input: RequestInfo | URL,
  init?: RequestInit,
): string {
  const raw = JSON.stringify({
    url: String(input),
    method: init?.method ?? 'GET',
    headers: init?.headers ?? {},
    body: init?.body ?? null,
  });

  return createHash('sha256').update(raw).digest('hex');
}

function getCacheFilePath(cacheKey: string): string {
  return path.join(process.cwd(), CACHE_DIR_NAME, 'fetch', `${cacheKey}.json`);
}

export async function fetchAndCache(
  input: RequestInfo | URL,
  init?: RequestInit,
  options: FetchAndCacheOptions = {},
): Promise<Response> {
  const maxAge = options.maxAge ?? 60 * 60;
  const method = (init?.method ?? 'GET').toUpperCase();

  if (method !== 'GET' && !options.cacheKey) {
    return fetch(input, init);
  }

  const cacheKey = options.cacheKey ?? createDefaultCacheKey(input, init);
  const filePath = getCacheFilePath(cacheKey);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  if (!options.forceRefresh) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const cached = JSON.parse(raw) as CachedResponseRecord;

      const ageSeconds = (Date.now() - cached.timestamp) / 1000;

      if (ageSeconds <= maxAge) {
        return new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: cached.headers,
        });
      }
    } catch {
      // cache miss or invalid cache; fetch fresh
    }
  }

  const res = await fetch(input, init);
  const body = await res.text();

  const record: CachedResponseRecord = {
    timestamp: Date.now(),
    status: res.status,
    statusText: res.statusText,
    headers: [...res.headers.entries()],
    body,
  };

  await fs.writeFile(filePath, JSON.stringify(record), 'utf8');

  return new Response(body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}
