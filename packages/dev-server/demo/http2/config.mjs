import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default {
  rootDir: resolve(fileURLToPath(import.meta.url), '..', '..'),
  http2: true,
  sslKey: './demo/http2/certs/.self-signed-dev-server-ssl.key',
  sslCert: './demo/http2/certs/.self-signed-dev-server-ssl.cert',
};
