(function () {
  function loadScript(src, type, attributes) {
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
  var polyfills = [];
  if (!('fetch' in window)) {
    polyfills.push(loadScript('./polyfills/fetch.js'));
  }
  if (!('noModule' in HTMLScriptElement.prototype)) {
    polyfills.push(loadScript('./polyfills/systemjs.js'));
  }
  function loadFiles() {
    if (!('noModule' in HTMLScriptElement.prototype)) {
      System.import('./legacy/app.js');
    } else {
      loadScript('./app.js', 'module', []);
    }
  }
  if (polyfills.length) {
    Promise.all(polyfills).then(loadFiles);
  } else {
    loadFiles();
  }
})();