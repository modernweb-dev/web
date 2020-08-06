import { Media } from '../dist/index';
import { Viewport } from '../dist/index';

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

export { Media, Viewport };
