---
title: The DOM
eleventyNavigation:
  key: DOM
  parent: Web Development
  order: 50
---

## Client-Rendered Web Apps

Not every web page sends all of its HTML along in the initial `GET` request. If you view source on some contemporary JavaScript-heavy websites or apps, you'll typically see something like this:

```html
<html>
  <body>
    <script src="bundle-807dj87x.js"></script>
    <div id="app"></div>
  </body>
</html>
```

Where the bundle script is a (sometimes large) payload of JavaScript that dynamically creates the rest of the page at run time. Single-page apps, or <abbr>SPA</abbr>s are a popular example of this type of web development.

Client-rendered websites aren't neccessarily poorly-built websites. Client-side rendering gives JavaScript developers tremendous flexibility, which is why SPA is (justifiably) such a popular development model, after all. But if the developers aren't careful, they might miss out on many of the performance optimizations, accessibility features, and user experiences that browsers are so good at, while making it harder to learn from the page-as-authored using "View Source".
For those reasons, websites should aim as much as possible to deliver their content as <abbr>HTML</abbr>.

Ultimately though, even if most of a website's over-the-wire content is JavaScript, it all gets rendered to HTML.
