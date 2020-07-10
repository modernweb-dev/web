export function neverImported() {
  return 'function is never imported';
}

export function neverCalled() {
  return 'function is never called';
}

export function neverCalledWithTrue(neverTrue) {
  if (neverTrue) {
    return 'condition is never returned';
  } else {
    return 6;
  }
}

export function calledOnce() {
  return 'this function is called once';
}

export function calledTwice() {
  return 'this function is called twice';
}

export function calledThrice() {
  return 'this function is called thrice';
}

class LocalClass {}

export class PublicClass {
  constructor(neverTrue) {
    if (neverTrue) {
      console.log('never logged');
    }

    if (window.neverTrue) {
      console.log('never true');
    }
  }

  neverCalled() {
    return 'function is never called';
  }

  calledOnce() {
    return 'this function is called once';
  }

  calledTwice() {
    return 'this function is called twice';
  }

  calledThrice() {
    return 'this function is called thrice';
  }
}

function localFunction() {
  const localVariable = 123;
}
