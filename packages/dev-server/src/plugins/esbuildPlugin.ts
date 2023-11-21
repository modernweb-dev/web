async function requirePlugin() {
  try {
    if (!import.meta.resolve) {
      throw new Error('import.meta was not set');
    }
    return await import('@web/dev-server-esbuild');
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

export async function esbuildPlugin(target: string | string[]) {
  const pluginModule = await requirePlugin();
  return pluginModule.esbuildPlugin({ target });
}
