import { useEffect, useState } from 'react';

/**
 * Utility for Storybook 7 to allow asyng loading in MDX.
 * @deprecated in Storybook 8 use MDX3 native await https://mdxjs.com/blog/v3/#await-in-mdx
 * @param {{ url: string, render: (content: string) => any }} props
 */
export const MDXFileLoader = ({ url, render }) => {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => setContent(text));
  }, []);
  if (!content) {
    return 'Loading...';
  }
  return render(content);
};
