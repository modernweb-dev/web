/**
 * Import a mockable version of a module to change its implementation.
 * @param {string} moduleSpecifier The specifier of the module. Bare module specifiers and server relative specifiers are supported. Regular relative paths are not supported
 * @returns {Promise<Record<string, func> | void >} Object with reassignable properties that match every export of the specified module.
 * If the specified module contains a default export, the export will be available from the `default` property. Only function expressions are supported when rewiring default exports.
 */
export async function importMockable(moduleSpecifier) {
  if (moduleSpecifier.includes('./')) {
    throw new Error(
      `Parameter \`moduleName\` ('${moduleSpecifier}') contains a relative reference. This is not supported. Convert \`moduleName\` first to a server relative path. (eg. \`new URL(import.meta.resolve(moduleName)).pathname\`)`,
    );
  }

  let module;
  try {
    module = await import(`/__intercept-module__?${moduleSpecifier}`);
  } catch (e) {
    throw new Error(
      `Module interception is not active. Make sure the \`moduleMockingPlugin\` of \`@web/test-runner-module-mocking\` is added to the Test Runner config.`,
    );
  }
  if (module.__wtr_error__) {
    throw new Error(module.__wtr_error__);
  }
  return module.__wtr_intercepted_module__;
}
