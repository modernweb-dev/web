import { request as originalRequest, RequestOptions, IncomingMessage } from 'http';

export interface Response {
  response: IncomingMessage;
  body?: string;
}

export function request(options: RequestOptions): Promise<Response> {
  return new Promise((resolve, reject) => {
    const req = originalRequest(options, response => {
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
