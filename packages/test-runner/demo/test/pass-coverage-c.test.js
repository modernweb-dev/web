import { calledThrice, PublicClass } from './pass-coverage.js';

calledThrice();
const publicClass = new PublicClass();
publicClass.calledThrice();
