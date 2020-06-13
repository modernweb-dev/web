export function createTestPage(testRunnerImport: string) {
  return `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script type="module">
      import "${testRunnerImport}";
    </script>
  </body>
</html>`;
}
