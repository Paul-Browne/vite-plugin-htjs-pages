import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { transformWithEsbuild } from 'vite';

export interface StaticAssetFile {
  absolutePath: string;
  relativePathFromSrc: string;
  outputFileName: string;
  kind: 'copy' | 'ts';
}

export interface CollectStaticAssetsArgs {
  root: string;
  pagesDir: string;
  pageExtensions: string[];
}

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/');
}

function hasAnySuffix(value: string, suffixes: string[]): boolean {
  return suffixes.some((suffix) => value.endsWith(suffix));
}

function toOutputFileName(relativePathFromSrc: string): string {
  if (relativePathFromSrc.endsWith('.ts')) {
    return relativePathFromSrc.slice(0, -3) + '.js';
  }
  return relativePathFromSrc;
}

export async function collectStaticAssets(
  args: CollectStaticAssetsArgs,
): Promise<StaticAssetFile[]> {
  const { root, pagesDir, pageExtensions } = args;
  const srcDir = path.join(root, pagesDir);

  const entries = await fg('**/*', {
    cwd: srcDir,
    onlyFiles: true,
    dot: false,
    absolute: false,
  });

  const assets: StaticAssetFile[] = [];

  for (const entry of entries) {
    const rel = normalizeSlashes(entry);

    if (hasAnySuffix(rel, pageExtensions)) {
      continue;
    }

    const absolutePath = path.join(srcDir, rel);

    if (rel.endsWith('.ts')) {
      assets.push({
        absolutePath,
        relativePathFromSrc: rel,
        outputFileName: normalizeSlashes(toOutputFileName(rel)),
        kind: 'ts',
      });
      continue;
    }

    assets.push({
      absolutePath,
      relativePathFromSrc: rel,
      outputFileName: normalizeSlashes(rel),
      kind: 'copy',
    });
  }

  return assets;
}

export async function buildStaticAssetSource(
  asset: StaticAssetFile,
): Promise<string | Uint8Array> {
  if (asset.kind === 'copy') {
    return fs.readFile(asset.absolutePath);
  }

  const source = await fs.readFile(asset.absolutePath, 'utf8');

  const result = await transformWithEsbuild(source, asset.absolutePath, {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
    sourcemap: false,
    minify: false,
  });

  return result.code;
}