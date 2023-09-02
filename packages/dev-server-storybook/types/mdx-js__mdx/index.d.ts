declare module '@mdx-js/mdx' {
  export default function async(
    src: string,
    options: { compilers: any; filepath: string },
  ): Promise<string>;
}
