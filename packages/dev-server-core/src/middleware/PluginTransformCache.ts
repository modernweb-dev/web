import LRUCache from 'lru-cache';
import { FSWatcher } from 'chokidar';
import { Context } from 'koa';
import { getResponseBody, getRequestFilePath, RequestCancelledError } from '../utils';

interface CacheEntry {
  body: string;
  headers: Record<string, string>;
  filePath: string;
}

export class PluginTransformCache {
  private cacheKeysForFilePaths = new Map<string, string>();

  private lruCache: LRUCache<string, CacheEntry>;

  constructor(private fileWatcher: FSWatcher, private rootDir: string) {
    this.lruCache = new LRUCache({
      length: (e, key) => e.body.length + (key ? key.length : 0),
      max: 52428800,
      noDisposeOnSet: true,
      dispose: cacheKey => {
        // remove file path -> url mapping when we are no longer caching it
        for (const [filePath, cacheKeyForFilePath] of this.cacheKeysForFilePaths.entries()) {
          if (cacheKeyForFilePath === cacheKey) {
            this.cacheKeysForFilePaths.delete(filePath);
            return;
          }
        }
      },
    });

    // remove file from cache on change
    fileWatcher.addListener('change', (filePath: string) => {
      const cacheKey = this.cacheKeysForFilePaths.get(filePath);
      if (cacheKey) {
        this.lruCache.del(cacheKey);
      }
    });
  }

  async get(context: Context) {
    return this.lruCache.get(context.url);
  }

  async set(context: Context) {
    try {
      const body = await getResponseBody(context);
      const filePath = getRequestFilePath(context, this.rootDir);

      if (typeof body === 'string') {
        this.cacheKeysForFilePaths.set(filePath, context.url);
        this.lruCache.set(context.url, {
          body,
          headers: context.response.headers,
          filePath,
        });
      }
    } catch (error) {
      if (error instanceof RequestCancelledError) {
        // no need to do anything if the request was cancelled
        return;
      }
      throw error;
    }
  }
}
