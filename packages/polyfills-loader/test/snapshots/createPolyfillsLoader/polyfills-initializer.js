(function () {
  function polyfillsLoader() {
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

    if ('noModule' in HTMLScriptElement.prototype && function () {
      try {
        Function('window.importShim = s => import(s);').call();
        return false;
      } catch (_) {
        return true;
      }
    }()) {
      polyfills.push(loadScript('./polyfills/dynamic-import.js').then(function () {
        window.dynamicImportPolyfill.initialize({
          importFunctionName: 'importShim'
        });
      }));
    }

    function loadFiles() {
      loadScript('./app.js', 'module');
    }

    if (polyfills.length) {
      Promise.all(polyfills).then(loadFiles);
    } else {
      loadFiles();
    }
  }

  if (!('noModule' in HTMLScriptElement.prototype)) {
    var s = document.createElement('script');

    function onLoaded() {
      document.head.removeChild(s);
      polyfillsLoader();
    }

    s.src = "polyfills/core-js.js";
    s.onload = onLoaded;

    s.onerror = function () {
      console.error('[polyfills-loader] failed to load: ' + s.src + ' check the network tab for HTTP status.');
      onLoaded();
    };

    document.head.appendChild(s);
  } else {
    polyfillsLoader();
  }
})();