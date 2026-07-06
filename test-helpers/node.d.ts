import type { OutputAsset, OutputChunk, OutputOptions, RollupBuild } from 'rollup';

export function timeout(ms?: number): Promise<void>;

export function fetchText(url: string, init?: RequestInit): Promise<string>;

export function assertIncludes(text: string, expected: string): void;
export function assertNotIncludes(text: string, expected: string): void;

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
