export function readConfig<T>(
  name: string,
  customPath?: string,
  basedir?: string,
): Promise<Partial<T | null>>;

export class ConfigLoaderError extends Error {}
