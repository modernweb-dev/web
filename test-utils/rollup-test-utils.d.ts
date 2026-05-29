import type { OutputOptions, RollupBuild, OutputChunk, OutputAsset } from 'rollup';

export function html(strings: TemplateStringsArray, ...values: string[]): string;
export function css(strings: TemplateStringsArray, ...values: string[]): string;
export function js(strings: TemplateStringsArray, ...values: string[]): string;
export function svg(strings: TemplateStringsArray, ...values: string[]): string;

export function generateTestBundle(
  build: RollupBuild,
  outputConfig: OutputOptions,
): Promise<{
  output: (OutputChunk | OutputAsset)[];
  chunks: Record<string, string>;
  assets: Record<string, string | Uint8Array>;
  assetsUnformatted: Record<string, string | Uint8Array>;
}>;

export function createApp(structure: Record<string, string | Buffer | object>): string;
export function cleanApp(): void;
