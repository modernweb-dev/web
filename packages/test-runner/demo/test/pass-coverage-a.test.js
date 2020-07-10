import {
  neverCalled,
  neverCalledWithTrue,
  calledOnce,
  calledTwice,
  calledThrice,
  PublicClass,
} from './pass-coverage.js';

neverCalledWithTrue();
calledOnce();
calledTwice();
calledThrice();
const publicClass = new PublicClass();
publicClass.calledOnce();
publicClass.calledTwice();
publicClass.calledThrice();
