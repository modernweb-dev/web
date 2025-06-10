// @ts-nocheck

if (!('json' in Response)) {
  Response.json = function (data, options = {}) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return new Response(JSON.stringify(data), {
      ...options,
      headers,
    });
  };
}
