---
title: CSS Browser Way
eleventyNavigation:
  key: CSS
  parent: Standards-Based
  order: 30
---

```js script
// TODO: find out why this is needed?
import { html } from 'lit-html';
```

Css shall be used to define the look for a give html content site displayed in the browser.

Be sure you are familiar with CSS before continuing. If you are unsure check out MDN's [Learn to style HTML using CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS).

## Using variables in css

Css itself offers the functionality to define css custom properties often also called css variables.

To define a variable you set it on a node buy using a custom name prefixed with `--`.

```css
html {
  --my-background-color: green;
  --my-variable: 12px;
}
```

Then you can use this variable by using `var(--variable-name, optional-fallback)`.

```css
.my-element {
  background: var(--my-background-color, #ccc);
  font-size: var(--my-variable);
}
```

Combine it and you will get something like this:

```html preview-story
<style>
  html {
    --my-variable: 12px;
  }

  h2 {
    font-size: var(--my-variable);
  }
</style>
<h2>hey there</h2>
```

## Shadow Dom

The browsers native way encapsulating stylings is [Shadom DOM](https://www.w3.org/TR/shadow-dom/).

It is...

TODO: for here or for open-wc??

## Shadow Dom Piercing Values

The following css declarations will pierce the shadow dom:

- css custom properties (css variables)
- font-color
- ...

Everything that inherits basically.
