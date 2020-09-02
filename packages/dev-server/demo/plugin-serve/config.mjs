import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const indexPath = path.resolve(__dirname, 'virtual-files', 'index.html');

function createServeHtmlPlugin() {
  return {
    serverStart({ fileWatcher }) {
      fileWatcher.add(indexPath);
    },

    serve(context) {
      if (['/', '/index.html'].includes(context.path)) {
        return { body: fs.readFileSync(indexPath, 'utf-8'), type: 'html' };
      }
    },
  };
}

export default {
  rootDir: resolve(fileURLToPath(import.meta.url), '..', '..', '..'),
  plugins: [createServeHtmlPlugin()],
};
