import { useEffect, useState } from 'react';

/**
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
