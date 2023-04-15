import { styles } from './styles.js';

const mocha = (window as any).mocha;
const mochaExports = (window as any).Mocha;

class SilentReporter extends mochaExports.reporters.Base {}

export function setupMocha(debug: boolean, testFrameworkConfig?: unknown) {
  const userOptions = typeof testFrameworkConfig === 'object' ? testFrameworkConfig : {};
  const mochaOptions = {
    ui: 'bdd' as const,
    allowUncaught: false,
    reporter: 'spec',
    ...userOptions,
  };

  if (mochaOptions.reporter === 'html') {
    const div = document.createElement('div');
    div.id = 'mocha';
    document.body.appendChild(div);

    const style = document.createElement('style');
    style.appendChild(document.createTextNode(styles));
    document.head.appendChild(style);
  } else if (!debug) {
    // in non-debug mode the user is not viewing the browser and so we avoid reporting for speed
    mochaOptions.reporter = SilentReporter as any;
  }

  mocha.setup(mochaOptions);
}
