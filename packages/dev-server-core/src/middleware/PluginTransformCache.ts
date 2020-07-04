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
  private cacheKeysPerFilePath = new Map<string, Set<string>>();

  private lruCache: LRUCache<string, CacheEntry>;

  constructor(private fileWatcher: FSWatcher, private rootDir: string) {
    this.lruCache = new LRUCache({
      length: (e, key) => e.body.length + (key ? key.length : 0),
      max: 52428800,
      noDisposeOnSet: true,
      dispose: cacheKey => {
        // remove file path -> url mapping when we are no longer caching it
        for (const [filePath, cacheKeysForFilePath] of this.cacheKeysPerFilePath.entries()) {
          if (cacheKeysForFilePath.has(cacheKey)) {
            this.cacheKeysPerFilePath.delete(filePath);
            return;
          }
        }
      },
    });

    // remove file from cache on change
    fileWatcher.addListener('change', (filePath: string) => {
      const cacheKeys = this.cacheKeysPerFilePath.get(filePath);
      if (cacheKeys) {
        for (const cacheKey of cacheKeys) {
          this.lruCache.del(cacheKey);
        }
      }
    });
  }

  async get(cacheKey: string) {
    return this.lruCache.get(cacheKey);
  }

  async set(context: Context, cacheKey: string) {
    try {
      const body = await getResponseBody(context);
      const filePath = getRequestFilePath(context, this.rootDir);

      if (typeof body === 'string') {
        let cacheKeysForFilePath = this.cacheKeysPerFilePath.get(filePath);
        if (!cacheKeysForFilePath) {
          cacheKeysForFilePath = new Set();
          this.cacheKeysPerFilePath.set(filePath, cacheKeysForFilePath);
        }
        cacheKeysForFilePath.add(cacheKey);

        this.lruCache.set(cacheKey, {
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
