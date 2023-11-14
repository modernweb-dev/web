/**
 * Intercept a module in order to change its implementation.
 * @param moduleName The name of the module to intercept. When intercepting the import of a module, the name should exactly match the name of the import.
 * @returns Writable object with every named export of the intercepted module as a property.
 * If the module to be intercepted contains a default export, the export will be available in the `default` property. Only function expressions are supported when intercepting default exports.
 */
export function interceptModule(moduleName: string): Promise<Record<string, func> | void>;
