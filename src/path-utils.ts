import path from 'node:path';

export function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

export function normalizeFsPath(value: string): string {
  return path.normalize(value);
}

export function normalizeRoutePath(value: string): string {
  const normalized = toPosix(value).replace(/\/+/g, '/');
  if (!normalized || normalized === '/') return '/';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

export function stripPageSuffix(
  filePath: string,
  extensions: string[],
): string {
  const normalized = toPosix(filePath);

  const match = [...extensions]
    .sort((a, b) => b.length - a.length)
    .find((ext) => normalized.endsWith(ext));

  if (!match) return normalized;

  return normalized.slice(0, -match.length);
}