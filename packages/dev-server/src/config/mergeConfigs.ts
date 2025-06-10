import { DevServerConfig } from './DevServerConfig.js';

const arrayKeys = ['plugins', 'middleware'];

export function mergeConfigs(...configs: Partial<DevServerConfig | undefined>[]) {
  const finalConfig: any = {
    plugins: [],
    middleware: [],
  };

  for (const config of configs) {
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        if (arrayKeys.includes(key)) {
          if (Array.isArray(value)) {
            finalConfig[key].push(...value);
          }
        } else {
          finalConfig[key] = value;
        }
      }
    }
  }

  return finalConfig as Partial<DevServerConfig>;
}
