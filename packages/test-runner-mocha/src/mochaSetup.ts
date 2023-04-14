import * as mocha from 'mocha';
import { styles } from './styles.js';

class SilentReporter {
  done() {
    return;
  }
}

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

  // @ts-ignore
  mocha.setup(mochaOptions);
}
