---
title: 'Introducing: Modern Web'
published: false
canonical_url: https://modern-web.dev/blog/introducing-modern-web/
description: Reexperience the joy of working with the standards based web. Starting off with a test runner which uses multiple browsers in parallel.
date: 2020-08-25
tags: [javascript, open-source]
cover_image: /blog/introducing-modern-web/introducing-modern-web-blog-header.jpg
socialMediaImage: /blog/introducing-modern-web/introducing-modern-web-blog-social-media-image.jpg
---

We are excited to finally introduce our brand new project: Modern Web.

## What is Modern Web?

A few years ago we started the [Open Web Components](https://open-wc.org/) project. Our goal was to help people develop web components, and we created guides and tools to help people do this. While working on this project, we realized that a lot of the things we were making were not necessarily specific to web components.

To maintain focus within the Open Web Components project, and to share our work with the larger developer community, we decided to split up the project and create Modern Web. Open Web Components will gain a renewed focus for web component specific topics, while in Modern Web we will work on generic tools and guides for web development.

## The goal for Modern Web

Modern browsers are a powerful platform for building websites and applications. Our goal is to work with what's available in the browser first before reaching for custom solutions.

When you're working _with_ the browser rather than against it, code, skills, and knowledge remain relevant for a longer time. Development becomes faster and debugging easier because there are fewer layers of abstractions involved.

At the same time, we are aware of the fact that not all problems can be solved elegantly by the browser today. We support developers making informed decisions about introducing tools and customizations to their projects, in such a way that developers can upgrade later as browser support improves.

Which leads us to our **Mission Statement**:

> Our goal is to enable efficient development using html, css, js with the browser while having as little abstraction as possible.

To clarify it's not about using ONLY the browser - that is "impossible/impractical" - it is about the tools you need to work efficiently with the browser while having as little abstraction as possible. It's not about teaching the big 3 (html, css, js) as that is already done for example on [MDN Web Docs](https://developer.mozilla.org/en-US/). It's about after you know the big 3 - we then highlight some things commonly forgotten/misunderstood and introduce you to our tools which enable you to only relay on the big 3.

This announcement marks the official release of Modern Web. Our website is live at [modern-web.dev](https://modern-web.dev), and our packages are available on NPM with the [@web](https://www.npmjs.com/org/web) namespace. Our code is open source and publicly available at [github.com/modernweb-dev/web](https://github.com/modernweb-dev/web). For updates, you can follow us on [Twitter](https://twitter.com/modern_web_dev) and if you like what you see please consider sponsoring the project on [Open Collective](https://opencollective.com/modern-web).

## Guides

On our all new [website](https://modern-web.dev), we've included a ["Guide"](../../guides/web-development/getting-started.md) section that teaches modern and not so modern browsers features that help with development. We don't aim to duplicate content already available on other websites, we primarily cover features and concepts that are often underused or misunderstood.

This includes for example:

- How web servers communicate with browsers (and it's limitations)
- Define the different types of links and show that semantic html makes sense
- Practical explanation about CSS Variables
- Importing relative resources or providing share functionality in JavaScript
- Practical explanation about the JavaScript module loading system

This section is an ongoing progress and would love your feedback and improvements.
Feel free to hit "Edit this page on GitHub!" or [open issues](https://github.com/modernweb-dev/web/issues/new) for questions.

## Web Dev Server

`es-dev-server` is the most popular package at Open Web Components. It is also the prime example of a tool that is not limited to web components alone. We've been working on its spiritual successor which we will call `web dev server` and we will publish it as the `@web/dev-server` package.

**Why another dev server?** To answer we need to understand that in a perfect world there probably would be no need for it.
However in our current world we have issues to deal with and most of them are in regards to some browsers or system not supporting a certain feature.
Furthermore the web dev sever is our fundament for most of our other tools therefore additional capabilities like customization and advanced configurations are a requirement. Non of the existing servers could support our key goals.

### Key goals of web dev server

- Support `bare modules` in JavaScript via node resolve
- Serve files as is without any processing on modern browsers
- Elaborate Plugin System (create your own)
- Enable SPA by routing all content to a specified page
- Improved Developer Experience (for example live reload)
- Core Plugins
  - Plugin to auto transpile for older browsers (to allow debugging and testing)
  - Plugin to support [Import maps](https://github.com/WICG/import-maps)
  - Plugin to support interoperability with [rollup plugins](https://rollupjs.org/guide/en/#plugin-development)
  - Plugin to enable [esbuild](https://github.com/evanw/esbuild)

Our web dev server is not quite finished _yet_, but we've already built the basic parts to power our web test runner. We are working hard on finalizing the open tasks on web dev server so stay tuned for further updates.

## Web Test Runner

We are very excited to announce today the official release candidate of [web test runner](../../docs/test-runner/overview.md), a project we have been working on for the past months.

**Why another test runner?** There are already a lot of testing solutions out there today. Unfortunately, all of them either run tests in Node.js and mock browser APIs using something like JSDom or don't support native es modules out of the box. We think that making browser code compatible for testing in node is unnecessarily complex. Running tests in real browsers gives greater confidence in (cross-browser) compatibility and makes writing and debugging tests more approachable.

By building on top of our web dev server, and modern browser launchers like Puppeteer and Playwright, we created a new test runner which fills this gap in the ecosystem. We think it is already feature-complete enough to be picked up by any web project.

### Key goals of web test runner

- 👉&nbsp;&nbsp; Headless browsers with [Puppeteer](../../docs/test-runner/browsers/puppeteer.md), [Playwright](../../docs/test-runner/browsers/playwright.md), or [Selenium](../../docs/test-runner/browsers/selenium.md). <br>
- 🚧&nbsp;&nbsp; Reports logs, 404s, and errors from the browser. <br>
- 🔍&nbsp;&nbsp; Debug opens a real browser window with devtools.<br>
- 🔧&nbsp;&nbsp; Exposes browser properties like viewport size and dark mode.<br>
- ⏱&nbsp;&nbsp;Runs tests in parallel and isolation.<br>
- 👀&nbsp;&nbsp; Interactive watch mode.<br>
- 🏃&nbsp;&nbsp; Fast development by rerunning only changed tests.<br>
- 🚀&nbsp;&nbsp; Powered by [esbuild](../../docs/dev-server/plugins/esbuild.md) and [rollup plugins](../../docs/dev-server/plugins/rollup.md)

If you wanna get started now take a look at our Web Test Runner [Getting Started Guide](../../guides/test-runner/getting-started.md).

## Web Building

Building your application is and will be a requirement a key feature if you want to get the best performance.
In this step we can do all kind of optimizations.

Non the less we wanna make clear that this building is completely optional during development. You write/generate html in any way you want and once you

**Why another building system?** This is not really a building system it's a suite of plugin for rollup[https://rollupjs.org/] to enable processing of html and to support conditional build for older browsers. This is needed as most current build systems only work with js files.

### Key goals of web building

- Work with html/css/js files
- Supports inline script modules
- Optimizes JavaScript
- Optimizes Assets (html, css, images, ...)
- Can builds two versions (for modern and legacy browsers)
- Can configure and include only needed polyfills

Our web building is not quite finished _yet_, but we will build on top of all experience we already have in this area. If you need something now you can take a look at [Open Web Components Building Rollup](https://open-wc.org/building/building-rollup.html).

## Web Documentation (rocket)

Writing documentation is a daunting task and often requires different expertise then the core development of web features like components, libraries and tools. We want to enable everyone to create a small high performant and high quality (documentation) site for their project.
In order to archive this we will combine all our tools with to g so developers can focus on the actual content.

As this is a goal that is somewhat different form our core mission we will realize this as a sister project code name "rocket".

**Why another documentation system?** All existing (documentation) tools we checked either ship with a huge framework or require substantial knowledge/work to set it up from scratch.

### Key goals of rocket

- Use markdown as your source
- Source markdown is readable/useable on github/gitlab/...
- Encourage separation between Guides/Docs
- Discourage usage of potentially "rude" language
- Make sure there are no broken links
- Allow for interactive demos (of ui elements)
- Do as much work as possible during building
- Ship with as little js as possible
- Provide a default theme out of the box
- Enable configuration by providing some override files
- Support usage of different themes
- Enable site to be a full Progressive Web App (PWA) with offline capabilities
- Based on [11ty](https://www.11ty.dev/), [web dev server](../../docs/dev-server/overview.md), web building

Rocket is still far from being finished. Although you can see it on our [website](https://modern-web.dev) in action it is missing a lot of features and is currently relatively hard coded to support our use case. We will continue evolving it and at some point (hopefully sooner then later) we will introduce to everyone.

## Web Components (open-wc)

Modern web focuses on generic web development and will not have specific guides on web components development or specific web components tools.
We will however not avoid them as they are the webs native component system after all.

Many of you may know us via Open Web Components so we want to ensure you that it's not going anymore. Modern Web is not a replacement but something complementary.

**Why another components system?** It's a trick question as we can say with 100% certainty that this is not a custom component system/framework but it's documentation and helpers around the browsers built in component system. It's functionally you don't need to ship yourself. Feel free to use it.

**Mission Statement Open Web Components**

> The goal of Open Web Components is to empower everyone with a powerful and battle-tested setup for sharing open source web components. We try to achieve this by giving a set of recommendations and defaults on how to facilitate your web component project. Our recommendations include: developing, linting, testing, tooling, demoing, publishing and automating.

Open Web Components will be transformed and will regain it's focus on Web Components when we move most generic tools into Modern Web.
Furthermore we will adopt Modern Web best practices regarding documentation by using rocket once it's a little more matured.

If you are interested in web components we recommend you check out [Open Web Components](https://open-wc.org).

## Thanks for reading

We are incredibly proud of our first Modern Web Tool, and we hope you find it useful as well. If you find an issue or if you are stuck [please let us know](https://github.com/modernweb-dev/web/issues/new).

There is much, much more to come so follow us on [Twitter](https://twitter.com/modern_web_dev) and if you like what you see please consider sponsoring the project on [Open Collective](https://opencollective.com/modern-web).

---

<span>Photo by <a href="https://unsplash.com/@lemonvlad">Vladislav Klapin</a> on <a href="https://unsplash.com/s/photos/hello">Unsplash</a></span>
