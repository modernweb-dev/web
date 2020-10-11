export const hmrClientScript = `
export const webSocket = ('WebSocket' in window) ?
  new WebSocket(\`ws\${location.protocol === 'https:' ? 's': ''}://\${location.host}\`, 'esm-hmr') : null;

if (webSocket) {
  webSocket.addEventListener('message', async (e) => {
    try {
      const message = JSON.parse(e.data);
      if (message.type === 'reload') {
        window.location.reload();
      } else if (message.type === 'update') {
        // TODO (43081j): one day i'll know what this should do, future-james' problem
      }
    } catch (error) {
      console.error('[hmr] Error while handling websocket message.');
      console.error(error);
    }
  });
}
`;
