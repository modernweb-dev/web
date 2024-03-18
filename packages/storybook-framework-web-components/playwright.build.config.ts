import baseConfig from './playwright.base.config.ts';

// @ts-ignore
baseConfig.webServer.command = 'npm run test:start:build';

export default baseConfig;
