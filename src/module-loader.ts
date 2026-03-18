import path from 'node:path';
import { createServer, type InlineConfig, type ViteDevServer } from 'vite';
import type { HtPageModule } from './types';

export type PageModuleLoader = (
  entryPath: string,
  relativePath: string,
) => Promise<HtPageModule>;

let buildServer: ViteDevServer | null = null;

export async function createPageModuleLoader(args: {
  mode: 'dev' | 'build';
  root: string;
  server?: ViteDevServer | null;
}): Promise<PageModuleLoader> {
  const { mode, root, server } = args;

  if (mode === 'dev') {
    if (!server) {
      throw new Error('[vite-plugin-html-pages] dev server not available');
    }

    return async (_entryPath, relativePath) => {
      const mod = await server.ssrLoadModule(`/${relativePath}`);
      return mod as HtPageModule;
    };
  }

  if (!buildServer) {
    const config: InlineConfig = {
      root,
      logLevel: 'error',
      appType: 'custom',
      server: {
        middlewareMode: true,
      },
      ssr: {
        noExternal: true,
      },
    };

    buildServer = await createServer(config);
  }

  return async (entryPath) => {
    const relativePath = '/' + path.relative(root, entryPath).replace(/\\/g, '/');
    const mod = await buildServer!.ssrLoadModule(relativePath);
    return mod as HtPageModule;
  };
}

export async function closePageModuleLoader(): Promise<void> {
  if (buildServer) {
    await buildServer.close();
    buildServer = null;
  }
}