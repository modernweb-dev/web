// must be valid names (without \0) to let the transform logic work, specifically "rollup-plugin-external-globals"
// must have extension, otherwise "fromRollup" adapter will resolve it incorrectly as an "outside of root" dir
const PREFIX = 'virtual-web-storybook-builder-';
export const virtualAppFilename = `${PREFIX}app.js`;
export const virtualSetupAddonsFilename = `${PREFIX}setup-addons.js`;
export const virtualStoriesFilename = `${PREFIX}stories.js`;
