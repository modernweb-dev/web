# Test Runner Visual Regression

Plugin for visual regression testing with Web Test Runner.

> This project is experimental. We are testing out different approaches and gathering feedback, let us know what you think and [join the discussion!](https://github.com/modernweb-dev/web/discussions/427).

## Usage

Install the package:

```
npm i --save-dev @web/test-runner-visual-regression
```

Add the plugin to you `web-test-runner.config.mjs`:

```js
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';

export default {
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),
    }),
  ],
};
```

Run a visual diff in your browser test:

```js
import { visualDiff } from '@web/test-runner-visual-regression';

it('can diff an element', async () => {
  const element = document.createElement('p');
  element.textContent = 'Hello world';
  element.style.color = 'blue';
  document.body.appendChild(element);

  await visualDiff(element, 'my-element');
});
```

## How it works

### Element

You call the `visualDiff` function with a reference to a DOM element. The element must be connected to the DOM, in the same document the tests are run in. You can also take a screenshot of the whole body for a full-page screenshot by passing in `document.body`. The element can also be in shadow DOM.

### Diffing

When you run a diff test for the first time, a baseline image is saved to `screenshots/baseline/${browser}/${name}.png`. Afterward, every time you do a diff it is compared to this baseline images.

If the difference between the two images is larger than the configured threshold, the test fails. The failed screenshot is saved as `screenshots/${browser}/failed/${name}.png` and an image illustrating the differences between the two images is saved as `screenshots/${browser}/failed/${name}-diff.png`.

### Updating diffs

When tests are run with the `update` option set to `true`, the new image will be saved as a baseline and the test will always pass.

In the example config, we read the command line args for a `--update-visual-baseline` flag, you can use this when running tests:

```
web-test-runner test/**/*.test.js --update-visual-baseline
```

## Configuration

These are all the possible configuration options. All options are optional:

```ts
import pixelmatch from 'pixelmatch';

type PixelMatchParams = Parameters<typeof pixelmatch>;
type PixelMatchOptions = PixelMatchParams[5];

export interface GetNameArgs {
  browser: string;
  name: string;
  testFile: string;
}

export interface ImageArgs {
  filePath: string;
  baseDir: string;
  name: string;
}

export interface SaveImageArgs extends ImageArgs {
  content: Buffer;
}

export type OptionalImage = Buffer | undefined | Promise<Buffer | undefined>;

export interface DiffResult {
  diffPercentage: number;
  diffImage: Buffer;
}

export interface DiffArgs {
  name: string;
  baselineImage: Buffer;
  image: Buffer;
  options: PixelMatchOptions;
}

export interface VisualRegressionPluginOptions {
  /**
   * Whether to update the baseline image instead of comparing
   * the image with the current baseline.
   */
  update: boolean;
  /**
   * The base directory to write images to.
   */
  baseDir: string;
  /**
   * Options to use when diffing images.
   */
  diffOptions: PixelMatchOptions;

  /**
   * Returns the name of the baseline image file. The name
   * is a path relative to the baseDir
   */
  getBaselineName: (args: GetNameArgs) => string;
  /**
   * Returns the name of the image file representing the difference
   * between the baseline and the new image. The name is a path
   * relative to the baseDir
   */
  getDiffName: (args: GetNameArgs) => string;
  /**
   * Returns the name of the failed image file. The name is a path
   * relative to the baseDir
   */
  getFailedName: (args: GetNameArgs) => string;

  /**
   * Returns the baseline image.
   */
  getBaseline: (args: ImageArgs) => OptionalImage;
  /**
   * Saves the baseline image.
   */
  saveBaseline: (args: SaveImageArgs) => void | Promise<void>;

  /**
   * Saves the image representing the difference between the
   * baseline and the new image.
   */
  saveDiff: (args: SaveImageArgs) => void | Promise<void>;
  /**
   * Saves the failed image file.
   */
  saveFailed: (args: SaveImageArgs) => void | Promise<void>;

  /**
   * Gets the difference between two images.
   */
  getImageDiff: (args: DiffArgs) => DiffResult | Promise<DiffResult>;

  /**
   * The threshold after which a diff is considered a failure, depending on the failureThresholdType.
   * For `failureThresholdType` of "percentage", this should be a number between 0-100.
   * For `failureThresholdType` of "pixels", this should be a positive integer.
   */
  failureThreshold: number;

  /**
   * The type of threshold that would trigger a failure.
   */
  failureThresholdType: 'percent' | 'pixel';
}
```

### Diffing options

We use the [pixelmatch](https://www.npmjs.com/package/pixelmatch) library for diffing images. You can configure the diffing options in the config.

```js
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';
import path from 'path';

export default {
  plugins: [
    visualRegressionPlugin({
      diffOptions: {
        threshold: 0.2,
        includeAA: false,
      },
    }),
  ],
};
```

### Names and directories

By default images are saved to disk to the `screenshots/${browser}/baseline` and `screenshots/${browser}/failed` directories. You can configure different directories or name patterns.

```js
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';
import path from 'path';

export default {
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),
      // configure the directory to output screenshots into
      // can also be an absolute path
      baseDir: 'screenshots',

      // configure the path relative to the basedir where to store individual screenshots
      // this can be used to configure different directories, or to change the names
      getBaselineName: ({ browser, name }) => path.join(browser, 'baseline', name),
      getDiffName: ({ browser, name }) => path.join(browser, 'failed', `${name}-diff`),
      getFailedName: ({ browser, name }) => path.join(browser, 'failed', name),
    }),
  ],
};
```

### Storing images externally

By default, we write files on disk, but you can configure this behavior from the config. This way you can, for example, upload images to an external service.

```js
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';
import path from 'path';

export default {
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),

      getBaseline({ filePath, baseDir, name }) {
        // read the baseline image from somewhere. this function can be async, and should
        // return a Buffer with the image data
      },
      saveBaseline({ filePath, content, baseDir, name }) {
        // save the baseline image somewhere. this function can be async.
      },
      saveDiff({ filePath, content, baseDir, name }) {
        // save the diff image somewhere. this function can be async.
      },
      saveFailed({ filePath, content, baseDir, name }) {
        // save the failed image somewhere. this function can be async.
      },
    }),
  ],
};
```

### Custom diffing

You can implement custom image diffing logic in the config. Use this to implement different diffing libraries.

```js
import { visualRegressionPlugin } from '@web/test-runner-visual-regression/plugin';
import path from 'path';

export default {
  plugins: [
    visualRegressionPlugin({
      update: process.argv.includes('--update-visual-baseline'),

      getImageDiff({
        options: VisualRegressionPluginOptions,
        image: Buffer,
        browser: string,
        name: string,
      }) {
        // read the baseline image from somewhere. this function can be async, and should
        // return a Buffer with the image data

        return {
          // return the diff percentage as a number between 0 and 100
          diffPercentage,
          // return the image representing the diff between the two images
          // this helps the user with debugging
          diffImage,
        };
      },
    }),
  ],
};
```
