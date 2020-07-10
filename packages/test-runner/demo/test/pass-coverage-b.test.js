import {
  neverCalled,
  neverCalledWithTrue,
  calledTwice,
  calledThrice,
  PublicClass,
} from './pass-coverage.js';

neverCalledWithTrue();
calledTwice();
calledThrice();
const publicClass = new PublicClass();
publicClass.calledTwice();
publicClass.calledThrice();
