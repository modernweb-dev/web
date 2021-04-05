---
"@web/test-runner-commands": patch
"@web/test-runner-core": patch
"@web/test-runner": patch
---

Add the `sendKeys` command

Sends a string of keys for the browser to press (all at once, as with single keys
or shortcuts; e.g. `{press: 'Tab'}` or `{press: 'Shift+a'}` or
`{press: 'Option+ArrowUp}`) or type (in sequence, e.g. `{type: 'Your name'}`) natively.

For specific documentation of the strings to leverage here, see the Playwright documentation,
here:

- `press`: https://playwright.dev/docs/api/class-keyboard#keyboardpresskey-options
- `type`: https://playwright.dev/docs/api/class-keyboard#keyboardtypetext-options

Or, the Puppeter documentation, here:

- `press`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardpresskey-options
- `type`: https://pptr.dev/#?product=Puppeteer&show=api-keyboardtypetext-options

@param payload An object including a `press` or `type` property an the associated string
    for the browser runner to apply via that input method.

@example
```ts
   await sendKeys({
       press: 'Tab',
   });
```

@example
```ts
   await sendKeys({
       type: 'Your address',
   });
```
