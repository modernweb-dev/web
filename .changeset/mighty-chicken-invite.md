---
'@web/test-runner-commands': minor
---

Added support for holding and releasing keys to the sendKeys command. The command now supports two additional actions `down` and `up` which hold down, or release a key. This effectively allows to hold down modifier keys while pressing other keys, which allows key combinations such as `Shift+Tab`.

@example
```ts
  await sendKeys({
    down: 'Shift',
  });
  await sendKeys({
    press: 'Tab',
  });
  await sendKeys({
    up: 'Shift',
  });
```
