---
title: HTML
eleventyNavigation:
  key: HTML
  parent: Web Development
  order: 20
---

<dfn>HTML</dfn> stands for <q>HyperText Markup Language</q>, <q>HyperText</q> being text documents containing interactive links to other such documents, and <q>Markup</q> meaning a syntax for applying semantics (such as those links) to that document.

As we saw in the [previous section](../servers-and-clients.md), HTML is the primary resource that servers send to browsers. Even if the web server is entirely dynamic, meaning it doesn't simply send the contents of `.html` files from its web root, it will still send a string of HTML for most requests. Every web page is, ultimately and essentially, an HTML document.

The purpose of this document isn't to present a comprehensive tutorial, but to highlight some of the imporant basic aspects of HTML.

## View Source

You can inspect every HTML page by context-clicking and selecting "View Page Source". This lets you see the complete HTML document for the page you are viewing.

When we were first exploring the web back in the 90s, "View Source" let us learn from others, and better understand how the web worked.

```html
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>My page</h1>
    <p>This page's content was authored in <abbr>HTML</abbr>.</p>
    <a href="/next.html">Next Page</a>
  </body>
</html>
```

## Hyperlinks

The "HT" in <abbr>HTML</abbr>, "HyperText", refers to the way in which documents can link to other documents. This is the fundamental feature of <abbr>HTML</abbr> and the most important feature of the web.

Hyperlinks ("links" for short) in <abbr>HTML</abbr> are represented by the [anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a). The `href` attribute contains the [URL](../servers-and-clients.md) which the hyperlink points to.

There are three basic types of URLs which you can link to:

1. [Fully-Qualified URLs](./#fully-qualified-urls)
2. [Absolute Urls](./#absolute-urls)
3. [Relative Urls](./#relative-urls)

### Fully Qualified URLs

The most specific type of URL is the fully-qualified URL. They contain a protocol; zero, one, or more subdomains; a domain name; and an optional path. They refer specifically to a single, unique resource. Some examples:

- `https://www.google.com`
- `https://modern-web.dev/docs/learn/standards-based/html/`
- `ws://demos.kaazing.com/echo`

Links with fully qualified URLs can link a page on your server, to pages on another server. This is what puts the "world-wide" in "world-wide-web". All the links to [MDN](https://developer.mozilla.org) in this article are like that.

```html
<a href="https://google.com/">if you click me I will open google</a>
```

Because the URL is fully-qualified,adding that `<a>` tag to any page anywhere on the web will have the same behavior[^1], namely opening google's home page.

[^1]: Assuming that the page doesn't use JavaScript or other techniques to surreptitiously change the destination of the link

### Absolute URLs

Absolute URLs contain only a path, omitting the protocol and origin. They always begin with `/`. Like fully-qualified URLs, they always refer to the same path relative to the origin, for example:

```html
<a href="/index.html">Home Page</a>
```

This link will have the same behaviour on all pages on `modern-web.dev`, namely returning to the Modern Web homepage. but if placed on `developer.mozilla.org`, will link to the MDN homepage, not Modern Web's.

Absolute links containing _only_ a `/` are special, they refer to the web root. In most cases, they are synonymous with `/index.html`.

### Relative URLs

The least specific type of URL is a relative URL. Like absolute URLs, they omit the protocol and origin, but unlike absolute URLs, which contain a full path, relattive URLs contain a partial, or relative path. They start with `./`, `../`, or simply a path to a resource. for example:

```html
<a href="../">Go Up</a>
<a href="./help.html">Go to Help Page</a>
<a href="help.html">Also Go to Help Page</a>
```

Relative URLs are relative to the current document, so they may have different behaviour depending on which page on a website they are used.

Given the following folder structure:

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
<a href="index.html">...</a>
```

A link within `help.html` would link to `index.html`. <br>
A link within `about/contact.html` would link to `about/index.html`.

## Semantic HTML

The "ML" in <abbr>HTML</abbr>, "Markup Language" means that HTML tags provide structure and context to the text of the document, they "mark the text up" with additional information that's useful to readers, assistive technology, and machines. Consider a list, for example. An author could create the visual effect of a list in HTML using only the <dfn>`<br/>`</dfn> (line break) tag and the <dfn>`&emsp`</dfn> (em-space [HTML entity](https://developer.mozilla.org/en-US/docs/Glossary/Entity)):

```HTML
A list:<br/>
<br/>
&emsp;1. First<br/>
&emsp;2. Second<br/>
&emsp;3. Third<br/>
<br/>
```

But there are several problems with this. First, the HTML is hard to read and hard to maintain. There's nothing here, aside from the text "A list", to indicate that this should be a list. Second, the markup doesn't actually provide any new information. Assistive technology or computers like web crawlers won't be able to identify this as a list of items. Third, it will be difficult to design the style of the page with CSS.

Much better to use what HTML provides, the <dfn>`<ol>`</ol> (ordered-list) tag.

```HTML
A list:
<ol>
  <li>First</li>
  <li>Second</li>
  <li>Third</li>
</ol>
```

[HTML has many semantic tags built-in](https://developer.mozilla.org/en-US/docs/Web/HTML/Element), including tags which group parts of the page into logical units, tags for page headings, and tags for displaying various specific kinds of information. Some of the lesser-known tags include:

- `<time>` for representing time values
- `<kbd>` for representing a keyboard key or key combination
- `<aside>` for representing content that is auxiliary to the main content
- `<article>` for a composed section of content that represents a coherent unit

### DIV Soup

Sometimes, when you [inspect a web page](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools), you'll see something like this:

```html
<div class="css-698um9">
  <div class="css-1tk5puc">
    <div class="css-jbmajz">
      <!-- ...etc -->
    </div>
  </div>
</div>
```

This "DIV soup" is a sign that the developers did not use semantic HTML. Users of assistive technology may have difficulty using this web page, computers may have difficulty parsing it (i.e. it may not rank highly on search engines), and developers will have difficulty understanding the structure of the HTML and the purpose of its various elements.

As much as possible, developers should strive to use the semantically correct HTML tags for their content.

## Learn more

If you wanna know more check out MDN's [HTML basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics).
