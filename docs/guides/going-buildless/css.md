---
title: CSS
eleventyNavigation:
  key: CSS
  parent: Going Buildless
  order: 30
---

```js script
// TODO: find out why this is needed?
import { html } from 'lit-html';
```

<abbr>CSS</abbr> stands for "Cascading Style Sheets", and it is the primary way to design web content, whether visually and audially.

The purpose of this document isn't to provide a comprehensive tutorial of CSS, or even to cover the basics, but rather to highlight some modern CSS techniques and workflows made possible by web standards. Be sure you are familiar with CSS before continuing. If you are unsure check out MDN's [Learn to style HTML using CSS](https://developer.mozilla.org/en-US/docs/guides/CSS).

## CSS Custom Properties

### Using Variables in CSS

In the late 2000s, CSS preprocessors like [LESS](http://lesscss.org) and [SASS](https://sass-lang.com) emerged, offering developers the ability to define variables in CSS just like they would in JavaScript. The advantages to style variables were clear for applications like

- Themeing
- Animations
- Maintainability

While developers continue to use these preprocessors to define variables in their styles, CSS itself offers the functionality to define variables, called "Custom Properties", and reuse them throughout the app. Custom properties begin with `--`, and can contain any CSS value, like colours, numbers, lengths, or functions like `calc`, `filter`, etc.

Define custom properties by setting them on a node, and they're scoped to the node they're defined on, for example:

```css
html {
  --my-background-color: green;
  --my-font-size: 12px;
}

article {
  --my-font-size: 24px;
}
```

Then you can use this variable by using `var(--variable-name, optional-fallback)`.

```css
p {
  background-color: var(--my-background-color, cornflowerblue);
  font-size: var(--my-font-size);
  padding: 4px var(--p-padding-horizontal, 6px);
}
```

You can also declare a variable by using it in scope with a fallback.

With this CSS in play, the following document would show two paragraphs, both `cornflowerblue`, one with large text.

```html preview-story
<style>
  html {
    --my-background-color: green;
    --my-font-size: 12px;
  }

  article {
    --my-font-size: 24px;
    --p-padding-horizontal: 12px;
  }

  p {
    display: inline-block;
    border-radius: 4px;
    padding: 4px var(--p-padding-horizontal, 6px);
    background-color: var(--my-background-color, cornflowerblue);
    font-size: var(--my-font-size);
  }
</style>

<p>Hello</p>

<article>
  <p>World</p>
</article>
```

The style rules which are ultimately applied to an element depend on all the rules applied to each of its parent elements, going back up to the root of the document. This allows designers to apply multiple stylesheets to a single document. The order and priority by which those rules apply is called the cascade, and that's the "C" in "CSS".

## Style Encapsulation

While the cascade is fundamental to CSS, and is certainly useful, it can at times make it more difficult to control the styles applied to a portion of a document. This is particularly important when designing reusable components, which should maintain their style no matter where they're used.

While a number of toolchains and techniques for achieving style encapsulation, like [BEM](http://getbem.com/introduction/) and [Styled Components](https://github.com/styled-components/styled-components), the web platform itself provides a native mechanism for isolating styles, called [Shadom DOM](https://www.w3.org/TR/shadow-dom/).

Isolating a portion of a document within a shadow root allows designers to write the CSS for that component without worrying about how their CSS will affect the rest of the document. Shadow DOM removes the need for complex CSS toolchains or naming conventions. Designers can use simple type, id, or class selectors, in that order.

### Inherited Values

Shadow roots prevent their internal styles from "leaking out" to affect the rest of the document, but they do not prevent document styles from "reaching in" to affect the internal styles of an encapsulated component. Specifically, [inheritted CSS properties](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance) are said to "pierce the shadow boundary" in that way.

Some commonly-used inherited properties include:

- `color`
- `font-size`
- `pointer-events`

All CSS custom properties are inherited, as well, meaning you can use them to pierce Shadow boundaries. This is a common way to apply a theme to a whole page, where individual components apply custom properties internally.

```CSS
html {
  --theme-heading-color: darkblue;
  --theme-border-radius: 4px;
  --theme-gap: 16px;
}
```
