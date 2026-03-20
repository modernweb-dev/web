---
"@web/browser-logs": major
---

BREAKING: Migrate to Node.js native test runner

- Replace Mocha with Node.js `node:test` module
- Replace Chai with Node.js `node:assert/strict`
- Use Node 24's native TypeScript type stripping (enabled by default)
- Update test imports for ES modules (__dirname, require)
- All 41 tests passing

**Migration:** No API changes. Development-only breaking change.

**For contributors:**
- Tests now use `node:test` instead of Mocha
- Use `npm run test:node` to run tests
- Node 24+ required for development
- TypeScript test files run directly without build step
