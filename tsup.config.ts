import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // external: [
  //   'vite',
  //   'rollup',
  //   'fast-glob',
  //   'p-limit',
  //   'node:path',
  //   'node:url',
  //   'node:fs/promises',
  //   'node:crypto',
  // ],
});