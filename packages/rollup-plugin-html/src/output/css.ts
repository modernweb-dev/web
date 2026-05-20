import path from 'path';
import type { OutputBundle, PluginContext } from 'rollup';
import { toBrowserPath } from './utils.js';

/**
 * Regular expression to match asset URL placeholders in CSS content.
 * Captures the hashes encoded as HEX strings like "abc123" from placeholders like "__ROLLUP_ASSET_URL_abc123__".
 */
const ASSET_URL_PLACEHOLDER_REGEX = /__ROLLUP_ASSET_URL_([a-f0-9]+)__/g;

/**
 * Creates a placeholder string for the given hash.
 *
 * @param hash - Hash encoded as a HEX string (e.g. "abc123")
 * @returns Placeholder string like "__ROLLUP_ASSET_URL_abc123__"
 */
export function createAssetPlaceholder(hash: string): string {
  return `__ROLLUP_ASSET_URL_${hash}__`;
}

/**
 * Replaces all asset URL placeholders in CSS content with resolved paths.
 *
 * @param cssContent - The CSS content with placeholders
 * @param resolver - Function that resolves a hash to the final path
 * @returns CSS content with placeholders replaced
 */
export function replacePlaceholders(
  cssContent: string,
  resolver: (hash: string) => string | undefined,
): string {
  return cssContent.replace(ASSET_URL_PLACEHOLDER_REGEX, (match, hash) => {
    const resolvedPath = resolver(hash);
    return resolvedPath ?? match;
  });
}

/**
 * Calculates the path from a CSS file to a referenced asset in the output.
 * If publicPath is provided, returns an absolute path. Otherwise returns a relative path.
 *
 * @param cssFilePath - The CSS file's path in the bundle (e.g. 'styles/main.css')
 * @param assetFilePath - The asset's path in the bundle (e.g. 'assets/image.png')
 * @param publicPath - Optional public path prefix (e.g. '/static/')
 * @returns Absolute path if publicPath provided, otherwise relative path from CSS to asset
 */
export function calculateRelativePath(
  cssFilePath: string,
  assetFilePath: string,
  publicPath?: string,
): string {
  if (publicPath) {
    return toBrowserPath(path.join(publicPath, assetFilePath));
  }

  const cssDir = path.dirname(cssFilePath);
  const relativePath = path.relative(cssDir, assetFilePath);
  return toBrowserPath(relativePath);
}

/**
 * Processes all CSS files in the bundle, replacing placeholders with resolved paths.
 *
 * @param {PluginContext} pluginContext - The Rollup plugin context
 * @param {OutputBundle} bundle - The Rollup output bundle
 * @param {Record<string, { ref: string }>} assetsInCssByHash - Map of asset hashes to their Rollup refs for assets found in CSS
 * @param {string} [publicPath] - Optional public path prefix for absolute URLs (e.g. '/static/')
 */
export function processCssAssets(
  pluginContext: PluginContext,
  bundle: OutputBundle,
  assetsInCssByHash: Record<string, { ref: string }>,
  publicPath?: string,
): void {
  for (const [filePath, asset] of Object.entries(bundle)) {
    if (asset.type !== 'asset' || !filePath.endsWith('.css')) continue;

    const cssContent =
      typeof asset.source === 'string' ? asset.source : Buffer.from(asset.source).toString('utf-8');

    const resolvedContent = replacePlaceholders(cssContent, (hash: string) => {
      const ref = assetsInCssByHash[hash]!.ref;
      const assetFilePath = pluginContext.getFileName(ref);
      return calculateRelativePath(filePath, assetFilePath, publicPath);
    });

    asset.source = resolvedContent;
  }
}
