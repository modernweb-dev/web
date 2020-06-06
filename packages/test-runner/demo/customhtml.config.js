module.exports = {
  html: ({ testRunnerImport }) => `
    <html>
      <head></head>
      <body>
        <script type="module">
          ${testRunnerImport}
        </script>
      </body>
    </html>
  `,
};
