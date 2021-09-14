import '../../../node_modules/mocha/mocha-es2018.js';
import { runMocha } from './mochaRun.js';

const mocha = (window as any).mocha as BrowserMocha;

runMocha(mocha);
