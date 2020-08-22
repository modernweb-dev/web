---
title: Using Typescript
eleventyNavigation:
  key: Using Typescript
  parent: Test Runner
  order: 60
---

[Typescript](https://www.typescriptlang.org/) is a superset of Javascript, adding type safety to your code.

> Browsers don't support Typescript syntax. Your code will need to be transformed before it is served to the browser, adding extra complexity and compilation time. While typescript can be a powerful addition to your project, we generally don't recommend it for beginners.

To get started with Typescript we recommend getting familiar with it first using the [official documentation](https://www.typescriptlang.org/).

## Setting up the project

First, we need to install the required dependencies:

```
npm i -D @web/test-runner @esm-bundle/chai @types/mocha typescript
```

Next, we need to run initialize typescript for our project:

```
npx typescript --init
```

This will create a `tsconfig.json` for your project in the current working directory.

At the time of writing this article, there are three options in the generated config that we need to change for running our code in the browser.

We need to make sure that `module` is set to `ESNext`, `target` to `es2017`, and `moduleResolution` to `node`.

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

## Add the test code

In this example, we will use the same test from one of the [Getting Started Guide](./getting-started.md), and convert it to Typescript.

Add the `src/sum.ts` file:

```ts
export function sum(...numbers: number[]) {
  let sum = 0;
  for (const number of numbers) {
    sum += number;
  }
  return sum;
}
```

Add the `test/sum.test.ts` file:

```ts
import { expect } from '@esm-bundle/chai';
import { sum } from '../src/sum.js';

it('sums up 2 numbers', () => {
  expect(sum(1, 1)).to.equal(2);
  expect(sum(3, 12)).to.equal(15);
});

it('sums up 3 numbers', () => {
  expect(sum(1, 1, 1)).to.equal(3);
  expect(sum(3, 12, 5)).to.equal(20);
});
```

> Notice that we're using the `.js` extension in our import. With native es modules, file extensions are required so we recommend using them even in Typescript files.

## Testing with TSC

The easiest way to use Typescript with the test runner is to use `tsc`, the official typescript compiler.

To do this, we first need to add some scripts to our `package.json`:

```json
{
  "scripts": {
    "test": "web-test-runner \"test/**/*.test.js\" --node-resolve",
    "build": "tsc"
  }
}
```

Now we can turn our TS code to JS by running the build command:

```
npm run build
```

You will see the built JS files appear next to your TS files:

```
.
├── src
│   ├── sum.js
│   └── sum.ts
├── test
│   ├── sum.test.js
│   ├── sum.test.ts
└── package.json
└── tsconfig.json
```

Now we can run the test runner on our JS files as we would normally:

```
npm test
```

## Source maps

When a test fails, the test runner prints a clickable link to the terminal output.
Let's see this in action by modifying our code to starting counting from `1` instead of `0`:

```ts
export function sum(...numbers: number[]) {
  let sum = 1; // <-- change this to 1
  for (const number of numbers) {
    sum += number;
  }
  return sum;
}
```

Now we re-build our code and run the tests:

```
npm run build
npm run test
```

And we will see errors in the terminal:

```
test/sum.test.js:

 ❌ sums up 2 numbers
      at: test/sum.test.js:4:26
      error: expected 3 to equal 2
      + expected - actual

      -3
      +2

 ❌ sums up 3 numbers
      at: test/sum.test.js:8:29
      error: expected 4 to equal 3
      + expected - actual

      -4
      +3

Chrome: |██████████████████████████████| 1/1 test files | 0 passed, 2 failed

Finished running tests in 0.9s with 2 failed tests.
```

As you can see, the errors point to `test/sum.test.js:4:26`. In most editors, you can click this link and go directly to your code. However, this will take us to the generated JS file, not the original TS source. This is not very useful for us.

To fix this, we can configure typescript to generate source maps. The test runner will use the source maps to point to the original source code.

Update your `tsconfig.json` with the `sourceMap` option:

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "ESNext",
    "moduleResolution": "node",
    "sourceMap": true
  }
}
```

Now if we re-build and test we will see the correct output:

```
test/sum.test.js:

 ❌ sums up 2 numbers
      at: test/sum.test.ts:5:23
      error: expected 3 to equal 2
      + expected - actual

      -3
      +2

 ❌ sums up 3 numbers
      at: test/sum.test.ts:10:26
      error: expected 4 to equal 3
      + expected - actual

      -4
      +3

Chrome: |██████████████████████████████| 1/1 test files | 0 passed, 2 failed

Finished running tests in 1s with 2 failed tests.
```

## Using tsc with watch mode

While developing we don't want to re-build our code manually every time there is a change. Both `tsc` and the test runner can run in watch mode, reloading automatically on changes.

Both tools print a lot of information to the terminal and clear it when rebuilding or running tests. We, therefore, recommend running both tools in a separate terminal window or tab. For VSCode you can take a look at [the docs](https://code.visualstudio.com/docs/editor/integrated-terminal#_managing-multiple-terminals) here.

Add the watch mode commands to your `package.json`:

```json
{
  "scripts": {
    "test": "web-test-runner \"test/**/*.test.js\" --node-resolve",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test:watch": "web-test-runner \"test/**/*.test.js\" --node-resolve --watch"
  }
}
```

Then, in one terminal run your build:

```
npm run build:watch
```

And in another terminal run your tests:

```
npm run test:watch
```

Your code will now be built whenever you edit code, and the test runner will re-run the tests accordingly.

## Testing with esbuild

`esbuild` is an alternative approach to using `tsc`. We can use it to compile TS to JS on the fly in the test runner itself.

The benefit is that it's a lot faster than `tsc` and you don't need to deal with any generated files in your file system. The downside is that it doesn't do any actual type checking.

To use `esbuild`, we recommend looking at the [plugin documentation](../../docs/dev-server/plugins/esbuild.md).

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/test-runner-typescript).
See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
