import { Context } from 'koa';

export function createTestPage(context: Context, testFrameworkImport: string) {
  return `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script type="module">
      import "${testFrameworkImport}${context.URL.search}";
    </script>
  </body>
</html>`;
}
