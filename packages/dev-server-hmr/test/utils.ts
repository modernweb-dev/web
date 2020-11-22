import { Context } from 'koa';

export const mockFile = (path: string, source: string) => ({
  name: `test-file:${path}`,
  serve: (context: Context) => {
    if (context.path === path) {
      return source;
    }
  },
});

export const mockFiles = (files: Record<string, string>) => ({
  name: `test-file:${Object.keys(files).join('_')}`,
  serve: (context: Context) => {
    for (const [path, source] of Object.entries(files)) {
      if (context.path === path) {
        return source;
      }
    }
  },
});
