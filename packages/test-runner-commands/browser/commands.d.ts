import {
  Media,
  Viewport,
  SendKeysPayload,
  A11ySnapshotPayload,
  WriteFilePayload,
  ReadFilePayload,
  RemoveFilePayload,
  SnapshotPluginConfig,
  SaveSnapshotPayload,
  SendMousePayload,
} from '../dist/index';

/**
 * Executes a command on the server. If this is a custom command, you need to implement a plugin
 * to execute this command.
 */
export function executeServerCommand<R, P>(command: string, payload?: P): Promise<R>;

/**
 * Sets the viewport of the browser.
 */
export function setViewport(viewport: Viewport): Promise<void>;

/**
 * Emulates browser media, such as screen/print or color scheme, to be used in
 * CSS media queries.
 *
 * The `forcedColors` property is Playwright-only API that does not work in WebKit.
 *
 * @example
 * ```ts
 *    await emulateMedia({
 *        colorScheme: 'dark',
 *        reducedMotion: 'reduce',
 *    });
 * ```
 *
 * @example
 * ```ts
 *    await emulateMedia({
 *        media: 'print',
 *    });
 * ```
 *
 * @example
 * ```ts
 *    await emulateMedia({
 *        forcedColors: 'active',
 *    });
 * ```
 */
export function emulateMedia(media: Media): Promise<void>;

/**
 * Sets the user agent of the browser. This is a puppeteer-only API.
 */
export function setUserAgent(userAgent: string): Promise<void>;

/**
 * Sends a string of keys for the browser to press (all at once, as with single keys
 * or shortcuts; e.g. `{press: 'Tab'}` or `{press: 'Shift+a'}` or
 * `{press: 'Option+ArrowUp}`) or type (in sequence, e.g. `{type: 'Your name'}`) natively.
 *
 * For specific documentation of the strings to leverage here, see the Playwright documentation,
 * here:
 *
 * - `press`: https://playwright.dev/docs/api/class-keyboard#keyboardpresskey-options
 * - `type`: https://playwright.dev/docs/api/class-keyboard#keyboardtypetext-options
 *
 * Or, the Puppeter documentation, here:
 *
 * - `press`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardpresskey-options
 * - `type`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardtypetext-options
 *
 * Or, the Webdriver documentation, here:
 *
 * https://webdriver.io/docs/api/browser/keys/
 *
 * @param payload An object including a `press` or `type` property an the associated string
 *     for the browser runner to apply via that input method.
 *
 * @example
 * ```ts
 *    await sendKeys({
 *        press: 'Tab',
 *    });
 * ```
 *
 * @example
 * ```ts
 *    await sendKeys({
 *        type: 'Your address',
 *    });
 * ```
 *
 **/
export function sendKeys(payload: SendKeysPayload): Promise<void>;

/**
 * Sends an action for the mouse to move it to a specific position or click a mouse button (left, middle, or right).
 *
 * WARNING: When moving the mouse or holding down a mouse button, the mouse stays in this state as long as
 * you do not explicitly move it to another position or release the button. For this reason, it is recommended
 * to reset the mouse state with the `resetMouse` command after each test case manipulating the mouse to avoid
 * unexpected side effects.
 *
 * @param payload An object representing a mouse action specified by the `type` property (move, click, down, up)
 *     and including some properties to configure this action.
 *
 * @example
 * ```ts
 *    await sendMouse({
 *        type: 'move',
 *        position: [100, 100]
 *    });
 * ```
 *
 * @example
 * ```ts
 *    await sendMouse({
 *        type: 'click',
 *        position: [100, 100],
 *        button: 'right'
 *    });
 * ```
 *
 * @example
 * ```ts
 *    await sendMouse({
 *        type: 'down'
 *    });
 * ```
 *
 **/
export function sendMouse(payload: SendMousePayload): Promise<void>;

/**
 * Resets the mouse position to (0, 0) and releases mouse buttons.
 *
 * Use this command to reset the mouse state after mouse manipulations by the `sendMouse` command.
 *
 * @example
 * ```
 * it('does something with the mouse', () => {
 *   await sendMouse({ type: 'move', position: [150, 150] });
 *   await sendMouse({ type: 'down', button: 'middle' });
 * });
 *
 * afterEach(() => {
 *   await resetMouse();
 * });
 * ```
 */
export function resetMouse(): Promise<void>;

/**
 * Request a snapshot of the Accessibility Tree of the entire page or starting from
 * the element that is obtained via the `selector` property of the `payload` argument.
 *
 * Learn more about the tree that is returned from Playwright here:
 * - https://playwright.dev/docs/api/class-accessibility/
 *
 * Learn more about the tree that is returned from Puppeteer here:
 * - https://pptr.dev/#?product=Puppeteer&show=api-class-accessibility
 *
 * @param payload An object including a `selector` property pointing to the root of the
 *     a11y tree you'd like returned.
 *
 * @example
 * ```ts
 *    await a11ySnapshot();
 * ```
 *
 * @example
 * ```ts
 *    await a11ySnapshot({
 *        selector: 'main'
 *    });
 * ```
 */
export function a11ySnapshot(payload: A11ySnapshotPayload): Promise<void>;

/**
 * Walk the provided accessibility tree that starts on `node` and test each
 * node in the tree until one is found that meast the `test` provided.
 *
 * Learn more about the tree that is returned from Playwright here:
 * - https://playwright.dev/docs/api/class-accessibility/
 *
 * Learn more about the tree that is returned from Puppeteer here:
 * - https://pptr.dev/#?product=Puppeteer&show=api-class-accessibility
 *
 * @param node
 * @param test
 *
 * @example
 * // return whether a node in the `snapshot` has `name: 'Label Text Value Text'`
 * ```ts
 *    findAccessibilityNode<{ name: string }>(
 *        snapshot,
 *        (node) => node.name === 'Label Text Value Text'
 *    )
 * ```
 */
export function findAccessibilityNode<TNode>(
  node: TNode & { children: TNode[] },
  test: (node: TNode) => boolean,
): TNode | null;

/**
 * Writes a file to disk.
 *
 * @param payload.filePath the path of the file to save. This is a path relative to the test file
 * being executed. It cannot be an absolute path.
 * @param payload.content the file content to save as a string.
 * @param payload.encoding optional encoding to use when saving the file.
 *
 * @example
 * ```ts
 *    await writeFile({ path: 'hello-world.txt', content: 'Hello world!' });
 * ```
 */
export function writeFile(payload: WriteFilePayload): Promise<void>;

/**
 * Reads a file from disk.
 *
 * @param payload.filePath the path of the file to read. This is a path relative to the test file
 * being executed. It cannot be an absolute path.
 * @param payload.encoding optional encoding to use when reading the file.
 *
 * @example
 * ```ts
 *    const content = await readFile({ path: 'hello-world.txt' });
 * ```
 */
export function readFile(payload: ReadFilePayload): Promise<string | undefined>;

/**
 * Removes a file from disk.
 *
 * @param payload.filePath the path of the file to remove. This is a path relative to the test file
 * being executed. It cannot be an absolute path.
 *
 * @example
 * ```ts
 *    await removeFile({ path: 'hello-world.txt' });
 * ```
 */
export function removeFile(payload: RemoveFilePayload): Promise<void>;

/**
 * Gets configuration for snapshot testing.
 *
 * @param payload.updateSnapshots whether to updated snapshots that are not the same
 */
export function getSnapshotConfig(): Promise<SnapshotPluginConfig>;

/**
 * Gets the snapshots stored for this test file.
 */
export function getSnapshots(): Promise<Record<string, string>>;

/**
 * Saves a snapshot for this test file.
 *
 * @param payload.name the name of the snapshot
 */
export function getSnapshot(options: { name: string }): Promise<string | undefined>;

/**
 * Saves a snapshot for this test file.
 *
 * @param payload.name the name of the snapshot
 * @param payload.content the content of the snapshot as a string
 */
export function saveSnapshot(options: SaveSnapshotPayload): Promise<void>;

/**
 * Removes stored snapshots for this test file.
 *
 * @param payload.name the name of the snapshot
 *
 */
export function removeSnapshot(options: { name: string }): Promise<void>;

/**
 * If no snapshot exists on disk or if update-snapshots is set to true server-side,
 * the passed snapshot is saved. Otherwise the snapshot is compared with what's stored
 * on disk. If the snapshots are not equal, an error is thrown.
 *
 * @param options
 */
export function compareSnapshot(options: { name: string; content: string }): Promise<void>;

export { Media, Viewport, SendKeysPayload, WriteFilePayload, ReadFilePayload, RemoveFilePayload };
