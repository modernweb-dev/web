/**
 * Import a mockable version of a module to change its implementation.
 * @param {string} moduleSpecifier The specifier of the module. Bare module specifiers and server relative specifiers are supported. Regular relative paths are not supported
 * @returns {Promise<Record<string, func> | void >} Object with reassignable properties that match every export of the specified module.
 * If the specified module contains a default export, the export will be available from the `default` property. Only function expressions are supported when rewiring default exports.
 */
export function importMockable(moduleSpecifier: string): Promise<Record<string, func> | void>;
