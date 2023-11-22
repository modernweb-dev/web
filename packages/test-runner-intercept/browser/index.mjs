/**
 * Intercept a module in order to change its implementation.
 * @param {string} moduleName The name of the module to intercept. When intercepting the import of a module, the name should exactly match the name of the import.
 * @returns {Promise<Record<string, func> | void >} Writable object with every named export of the intercepted module as a property.
 * If the module to be intercepted contains a default export, the export will be available in the `default` property. Only function expressions are supported when intercepting default exports.
 */
export async function interceptModule(moduleName) {
  if (moduleName.includes('./')) {
    throw new Error(
      `Parameter \`moduleName\` ('${moduleName}') contains a relative reference. This is not supported. Convert \`moduleName\` first to a server relative path. (eg. \`new URL(import.meta.resolve(moduleName)).pathname\`)`,
    );
  }

  let module;
  try {
    module = await import(`/__intercept-module__?${moduleName}`);
  } catch (e) {
    throw new Error(
      `Module interception is not active. Make sure the \`interceptModulePlugin\` of \`@web/test-runner-intercept\` is added to the Test Runner config.`,
    );
  }
  if (module.__wtr_error__) {
    throw new Error(module.__wtr_error__);
  }
  return module.__wtr_intercepted_module__;
}
