(function () {
  function loadScript(src, type) {
    return new Promise(function (resolve) {
      var script = document.createElement('script');

      function onLoaded() {
        if (script.parentElement) {
          script.parentElement.removeChild(script);
        }

        resolve();
      }

      script.src = src;
      script.onload = onLoaded;

      script.onerror = function () {
        console.error('[polyfills-loader] failed to load: ' + src + ' check the network tab for HTTP status.');
        onLoaded();
      };

      if (type) script.type = type;
      document.head.appendChild(script);
    });
  }

  var polyfills = [];

  if (!('fetch' in window)) {
    polyfills.push(loadScript('./polyfills/fetch.js'));
  }

  polyfills.push(loadScript('./polyfills/systemjs.js'));

  function loadFiles() {
    [function () {
      return loadScript('./app.js', 'module');
    }, function () {
      return loadScript('./shared.js');
    }, function () {
      return System.import('./other.js');
    }].reduce(function (a, c) {
      return a.then(c);
    }, Promise.resolve());
  }

  if (polyfills.length) {
    Promise.all(polyfills).then(loadFiles);
  } else {
    loadFiles();
  }
})();