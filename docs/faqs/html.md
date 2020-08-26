---
title: HTML
eleventyNavigation:
  key: HTML
  # parent: Going Buildless
  order: 20
---

<dfn>HTML</dfn> stands for <q>HyperText Markup Language</q>, <q>HyperText</q> being text documents containing interactive links to other such documents, and <q>Markup</q> meaning a syntax for applying semantics (such as those links) to that document.

As we saw in the [previous section](./servers-and-clients.md), HTML is the primary resource that servers send to browsers. Even if the web server is entirely dynamic, meaning it doesn't send the contents of `.html` files from its web root, it will still send a string of HTML for most requests. Every web page is, ultimately and essentially, an HTML document.

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

Sometimes, when you [inspect a web page](https://developer.mozilla.org/en-US/docs/guides/Common_questions/What_are_browser_developer_tools), you'll see something like this:

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

If you wanna know more check out MDN's [HTML basics](https://developer.mozilla.org/en-US/docs/guides/Getting_started_with_the_web/HTML_basics).
