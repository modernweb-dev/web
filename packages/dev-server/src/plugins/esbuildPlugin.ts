import { createRequire } from 'node:module';

// @ts-ignore import.meta works at runtime on Node 24
const require = createRequire(import.meta.url);

function requirePlugin() {
  try {
    const path = require.resolve('@web/dev-server-esbuild');
    return require(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'You need to add @web/dev-server-esbuild as a dependency of your project to use the esbuild flags.',
      );
    } else {
      throw error;
    }
  }
}

export function esbuildPlugin(target: string | string[]) {
  const pluginModule = requirePlugin();
  return pluginModule.esbuildPlugin({ target });
}
