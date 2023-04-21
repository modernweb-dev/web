import { browserScript } from '@web/browser-logs';

export const trackBrowserLogs = `<script type="module">(function () {
  ${browserScript}
  window.__wtr_browser_logs__.logs = [];

  var types = ['log', 'debug', 'warn', 'error'];
  types.forEach(function (type) {
    var original = console[type];
    console[type] = function () {
      var args = [];
      for (let i = 0; i < arguments.length; i ++) {
        args.push(window.__wtr_browser_logs__.serialize(arguments[i]));
      }
      window.__wtr_browser_logs__.logs.push({ type: type, args: args });
      original.apply(console, arguments);
    };
  });
})();</script>`;
