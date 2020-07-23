class PrivateClassFields {
  #foo = 'bar';

  #bar() {
    return this.#foo;
  }

  bar() {
    return this.#bar();
  }
}
