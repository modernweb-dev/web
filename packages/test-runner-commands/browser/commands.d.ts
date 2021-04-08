import { Media } from '../dist/index';
import { Viewport } from '../dist/index';
import { SendKeysPayload } from '../dist/index';

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
 * The reducedMotion option is a puppeteer-only API.
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
 * @param payload An object including a `press` or `type` property an the associated string
 *     for the browser runner to apply via that input method.
 *
 * * @example
 * ```ts
 *    await sendKeys({
 *        press: 'Tab',
 *    });
 * ```
 *
 * * @example
 * ```ts
 *    await sendKeys({
 *        type: 'Your address',
 *    });
 * ```
 *
 **/
export function sendKeys(payload: SendKeysPayload): Promise<void>;

export { Media, Viewport, SendKeysPayload };
