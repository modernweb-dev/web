---
title: HTML
eleventyNavigation:
  key: HTML
  parent: Standards-Based
  order: 20
---

<dfn>HTML</dfn> stands for <q>HyperText Markup Language</q>, <q>HyperText</q> being text documents containing interactive links to other such documents, and <q>Markup</q> meaning a syntax for applying semantics (such as those links) to that document.

As we saw in the [previous section](../servers-and-clients.md), HTML is the primary resource that servers send to browsers. Even if the web server is entirely dynamic, meaning it doesn't simply send the contents of `.html` files from its web root, it will still send a string of HTML for most requests. Every web page is, ultimately and essentially, an HTML document.

## View Source

You can inspect every HTML page by context-clicking and selecting "View Page Source". This lets you see the complete HTML document for the page you are viewing.

When we were first exploring the web back in the 90s, "View Source" let us learn from others, and better understand how the web worked.

If you view source on some contemporary JavaScript-heavy websites or apps, you'll typically see something like this:

```html
<html>
  <body>
    <script src="bundle-807dj87x.js"></script>
    <div id="app"></div>
  </body>
</html>
```

Where the bundle provides a large payload of JavaScript that dynamically creates the rest of the page at run time.

This gives JavaScript developers tremendous flexibility, but can prevent many of the optimizations, accessibility features, and user experiences that browsers are so good at, not to mention making it harder to learn from the page-as-authored using "View Source"

Websites should aim to deliver their content as <abbr>HTML</abbr> as much as possible

```html
<html>
  <body>
    <h1>My page</h1>
    <p>With some content in <abbr>HTML</abbr></p>
  </body>
</html>
```

## Semantic HTML

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
