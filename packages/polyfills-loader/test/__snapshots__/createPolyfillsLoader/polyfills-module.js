(function () {
  function polyfillsLoader() {
    function loadScript(src, type, attributes) {
      return new Promise(function (resolve) {
        var script = document.createElement('script');
        script.fetchPriority = 'high';
        function onLoaded() {
          if (script.parentElement) {
            script.parentElement.removeChild(script);
          }
          resolve();
        }
        script.src = src;
        script.onload = onLoaded;
        if (attributes) {
          attributes.forEach(function (att) {
            script.setAttribute(att.name, att.value);
          });
        }
        script.onerror = function () {
          console.error('[polyfills-loader] failed to load: ' + src + ' check the network tab for HTTP status.');
          onLoaded();
        };
        if (type) script.type = type;
        document.head.appendChild(script);
      });
    }
    loadScript('./app.js', 'module', []);
  }
  if (!('noModule' in HTMLScriptElement.prototype)) {
    var s = document.createElement('script');
    s.fetchPriority = 'high';
    function onLoaded() {
      document.head.removeChild(s);
      polyfillsLoader();
    }
    s.src = "./polyfills/core-js.js";
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