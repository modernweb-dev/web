export default {
  rootDir: '../../',
  nodeResolve: true,
  testRunnerHtml: testRunnerImport => `
    <html>
      <head></head>
      <body>
        <script type="module">
          import '${testRunnerImport}';
          console.log("custom HTML page");
        </script>
      </body>
    </html>
  `,
};
