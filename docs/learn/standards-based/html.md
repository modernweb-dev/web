---
title: HTML Browser Way
eleventyNavigation:
  key: HTML
  parent: Standards-Based
  order: 20
---

```js script
// TODO: find out why this is needed?
import { html } from 'lit-html';
```

Html shall be used to ship content to your users.

Be sure you are familiar with HTML before continuing. If you are unsure check out MDN's [HTML basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics).

## Take a look at your favorite website

You can inspect every HTML page by right Clicking and selection "View Page Source".
Sadly this will often only look like this

```html
<html>
  <body>
    <script>
      // lots of JavaScript code
      // content "encoded" in JavaScript
    </script>
  </body>
</html>
```

This will prevent any render optimizations browsers are so good at 😅

What we more want to see is the actual content in html

```html
<html>
  <body>
    <h1>My page</h1>
    <p>With some content in html</p>
  </body>
</html>
```

No go out there and check all the pages and if you find actual shipped html then know this page is awesome 💪

## Html Structure has meaning

Even if only JavaScript gets send over the wire at some point it all becomes rendered into the html **document object model** (**DOM**).

And this DOM often looks like this

```html
<div class="css-698um9">
  <div class="css-1tk5puc">
    <div class="css-jbmajz">
      <!-- ... -->
    </div>
  </div>
</div>
```

In order to give structure to the content and meaning to the tree which is also very important for **Accessibility**(**A11y**) it is more beneficial to have use semantically html elements.

```html
<!-- TODO: add example -->
```

## Links

Linking between multiple html files has always been on of HTML core features.
There are 3 fundamental ways to link

### 1. Full links

Links that start with `http` specify the full URL e.g. domain + path are considered absolute link.

```html
<a href="https://google.com/">if you click me I will open google</a>
```

No matter in which page/html this link is places it will always open the same full url.

### 2. Absolute links

Links that start with `/` are treated as absolute and will link always to the domain.

Given the following link on `my-domain.com`.

```html
<a href="/help.html">...</a>
```

It will always link to `https://my-domain.com/help.html`. <br>
A href `/about/` will always link to `https://my-domain.com/about/`.

### 3. Relative Link

Link that start with `./` or directly with the path are considered relative link.

For relative links the location of the document influences the links destination.

Given the following folder structure

```
.
├── about
│   ├── index.html
│   └── contact.html
├── help.html
└── index.html
```

And the following link tag

```html
<a href="./index.html">...</a>
<!-- or -->
<a href="index.html">...</a>
```

A link within `help.html` would link to `index.html`. <br>
A link within `about/contact.html` would link to `about/index.html`.

## Learn more

If you wanna know more check out MDN's [HTML basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics).
