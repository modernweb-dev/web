import path from 'path';
import { OutputBundle, PluginContext } from 'rollup';
import { toBrowserPath } from './utils.js';

/**
 * Regular expression to match asset URL placeholders in CSS content.
 * Captures the reference ID like "abc123" from placeholders like "__ROLLUP_ASSET_URL_abc123__".
 * Note: Rollup reference IDs can contain alphanumeric characters, underscores, and $ (base-64-like encoding).
 */
const ASSET_URL_PLACEHOLDER_REGEX = /__ROLLUP_ASSET_URL_([a-zA-Z0-9_$]+)__/g;

/**
 * Creates a placeholder string for the given reference ID.
 * @param refId - The Rollup file reference ID
 * @returns Placeholder string like "__ROLLUP_ASSET_URL_abc123__"
 */
export function createAssetPlaceholder(refId: string): string {
  return `__ROLLUP_ASSET_URL_${refId}__`;
}

/**
 * Replaces all asset URL placeholders in CSS content with resolved paths.
 * Anything after the placeholder (#id, ?queryString) is preserved naturally.
 *
 * @param cssContent - The CSS content with placeholders
 * @param resolver - Function that resolves a reference ID to the final path
 * @returns CSS content with placeholders replaced
 */
export function replacePlaceholders(
  cssContent: string,
  resolver: (refId: string) => string | undefined,
): string {
  return cssContent.replace(ASSET_URL_PLACEHOLDER_REGEX, (match, refId) => {
    const resolvedPath = resolver(refId);
    return resolvedPath ?? match;
  });
}

/**
 * Calculates the path from a CSS file to a referenced asset.
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
  // If publicPath is provided, return an absolute path
  if (publicPath) {
    return toBrowserPath(`${publicPath}${assetFilePath}`);
  }

  // Otherwise, calculate relative path
  const cssDir = path.dirname(cssFilePath);
  const relativePath = path.relative(cssDir, assetFilePath);

  // Convert to browser-style forward slashes
  return toBrowserPath(relativePath);
}

/**
 * Processes all CSS files in the bundle, replacing placeholders with resolved paths.
 *
 * @param {PluginContext} pluginContext - the Rollup plugin context
 * @param {OutputBundle} bundle - the Rollup output bundle
 * @param {string} [publicPath] - Optional public path prefix for absolute URLs (e.g. '/static/')
 */
export function processCssAssets(
  pluginContext: PluginContext,
  bundle: OutputBundle,
  publicPath?: string,
): void {
  for (const [fileName, asset] of Object.entries(bundle)) {
    if (asset.type !== 'asset' || !fileName.endsWith('.css')) continue;

    const content =
      typeof asset.source === 'string' ? asset.source : Buffer.from(asset.source).toString('utf-8');

    const resolvedContent = replacePlaceholders(content, (refId: string) => {
      try {
        const assetFileName = pluginContext.getFileName(refId);
        return calculateRelativePath(fileName, assetFileName, publicPath);
      } catch {
        pluginContext.error(`Could not resolve CSS asset reference '${refId}' in ${fileName}`);
      }
    });

    asset.source = resolvedContent;
  }
}
