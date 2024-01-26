/**
 * Entrypoint for bundling MSW for the browser. Currently MSW uses
 * a barrel file as entrypoint, which leads to a lot of unnecessary
 * JS files being loaded in the browser.
 */
export { setupWorker } from 'msw/browser';
export { http } from 'msw';
