declare module '@mdx-js/mdx' {
  export async function compile(src: string, options: Record<string, unknown>): Promise<string>;
}
