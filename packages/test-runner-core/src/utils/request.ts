import { request as httpRequest, RequestOptions, IncomingMessage } from 'http';
import { request as httpsRequest, RequestOptions as HttpsRequestOptions } from 'https';

export interface Response {
  response: IncomingMessage;
  body?: string;
}

export function request(options: RequestOptions): Promise<Response> {
  const isHttps = options.protocol === 'https:';

  const requestFn = isHttps ? httpsRequest : httpRequest;

  if (isHttps) {
    (options as HttpsRequestOptions).rejectUnauthorized = false;
  }

  return new Promise((resolve, reject) => {
    const req = requestFn(options, response => {
      let body = '';
      response.on('data', chunk => {
        body += chunk;
      });

      response.on('end', () => {
        resolve({ response, body });
      });
    });

    req.on('error', err => {
      reject(err);
    });

    req.end();
  });
}
