---
title: JavaScript Browser Way
eleventyNavigation:
  key: JavaScript
  parent: Standards-Based
  order: 40
---

JavaScript is a scripting language that you can use to dynamically manipulate the currently viewed HTML document.
This enables you to get manage user interaction.

Be sure you are familiar with JavaScript before continuing. If you are unsure check out [JavaScript — Dynamic client-side scripting](https://developer.mozilla.org/en-US/docs/Learn/JavaScript).

Before we can start using something we need to understand what it is and what we can achieve with it.

## Including images in Javascript

You can use relative to your current js file urls by using `import.meta.url`.

```js
const imgUrl = new Url('./relative/path/from/current/js/fileto/img.png', import.meta.url);
```

## JavaScript offers a way to extract shared functionality

> A mixin is an abstract subclass; i.e. a subclass definition that may be applied to different superclasses to create a related family of modified classes.
>
> - Gilad Bracha and William Cook, [Mixin-based Inheritance](http://www.bracha.org/oopsla90.pdf)

Let's take for example Logging. Imagine you have 3 Pages

- Red
- Green
- Blue

```
              +----------+
              |   Page   |
              +----------+
                |  |  |
     +----------+  |  +-----------+
     |             |              |
+---------+ +-----------+ +----------+
| PageRed | | PageGreen | | PageBlue |
+----+----+ +-----------+ +----------+

```

```js
class Page {}
class PageRed extends Page {}
class PageGreen extends Page {}
class PageBlue extends Page {}
```

Now we want to log whenever someone goes on Page Red.
To achieve that we extend Page Red and make a Logged Page Red.

```
              +----------+
              |   Page   |
              +-+--+--+--+
                |  |  |
     +----------+  |  +-----------+
     |             |              |
+----+----+  +-----+-----+  +-----+----+
| PageRed |  | PageGreen |  | PageBlue |
+----+----+  +-----------+  +----------+
     |
+----+----+
| Logged  |
| PageRed |
+---------+
```

```js
class Page {}
class PageRed extends Page {}
class PageGreen extends Page {}
class PageBlue extends Page {}
class LoggedPagRed extends PageRed {}
```

If we want to start logging for PageGreen we have an issue:

- we can't put the logic in `Page` as Blue should not be logged
- we can't reuse the logic in `Logged PageGreen` as we can not extend from 2 sources (even if we could it would mean conflicting info in Red and Green)

What we can do is put it in an "external" place and write it so it can be "mixed in".

```
               +----------+                +----------+
               |   Page   |                | Logging* |
               +-+--+--+--+                +----------+
                 |  |  |
      +----------+  |  +-----------+
      |             |              |
+-----+----+  +-----+-----+  +-----+----+
| PageRed  |  | PageGreen |  | PageBlue |
|  with    |  |   with    |  +----------+
| Logging* |  |  Logging* |
+----------+  +-----------+
```

```js
// defining the Mixin
export const LoggingMixin = superclass =>
  class LoggingMixin extends superclass {
    // logging logic
  };

class Page {}
// applying a Mixin
class PageRed extends LoggingMixin(Page) {}
class PageGreen extends LoggingMixin(Page) {}
class PageBlue extends Page {}
```

With that approach we can extract logic into a separate code piece we can use where needed.

### Read More

For a more in-depth technical explanation please read [Real Mixins with JavaScript Classes](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/).

You can see the full blog post [Using JavaScript Mixins The Good Parts](https://dev.to/open-wc/using-javascript-mixins-the-good-parts-4l60).
