declare module 'storybook-addon-markdown-docs' {
  export function mdjsToCsf(
    markdown: string,
    filePath: string,
    projectType: string,
    options?: Record<string, unknown>,
  ): Promise<string>;
}
