---
title: 'Introducing: Modern Web'
pageTitle: 'Introducing: Modern Web'
published: true
canonical_url: https://modern-web.dev/blog/introducing-modern-web/
description: 'Our goal is to provide developers with the guides and tools they need to build for the modern web. We aim to work closely with the browser, and avoid complex abstractions'
tags: [javascript, opensource, modernweb]
cover_image: https://github.com/modernweb-dev/web/raw/master/docs/blog/introducing-modern-web/introducing-modern-web-blog-header.jpg
socialMediaImage: /blog/introducing-modern-web/introducing-modern-web-blog-social-media-image.jpg
---

We are excited to finally introduce our brand new project: Modern Web.

## What is Modern Web?

A few years ago we started the [Open Web Components](https://open-wc.org/) project. Our goal was to help people develop web components, and we created guides and tools to help people do this. While working on this project, we realized that a lot of the things we were making were not necessarily specific to web components.

To maintain focus within the Open Web Components project, and to share our work with the larger developer community, we decided to split up the project and create Modern Web. Don't worry, Open Web Components is not going away! It will gain a renewed focus for web component specific topics, while in Modern Web we will work on generic tools and guides for web development.

## The goal for Modern Web

> Our goal is to provide developers with the guides and tools they need to build for the modern web. We aim to work closely with the browser and avoid complex abstractions.

Modern browsers are a powerful platform for building websites and applications. We try to work with what's available in the browser first before reaching for custom solutions.

When you're working _with_ the browser rather than against it, code, skills, and knowledge remain relevant for a longer time. Development becomes faster and debugging is easier because there are fewer layers of abstraction involved.

At the same time, we are aware of the fact that not all problems can be solved elegantly by the browser today. We support developers making informed decisions about introducing tools and customizations to their projects, in such a way that developers can upgrade later as browser support improves.

## Our plan for the future

This announcement marks the official release of Modern Web. Our website is live at [modern-web.dev](https://modern-web.dev), and our packages are available on NPM under the [@web](https://www.npmjs.com/org/web) namespace. Our code is open-source and publicly available at [github.com/modernweb-dev/web](https://github.com/modernweb-dev/web).

For updates, you can follow us on [Twitter](https://twitter.com/modern_web_dev), and if you like what you see please consider sponsoring the project on [Open Collective](https://opencollective.com/modern-web).

We have been working on a lot of different projects in the last couple of years. In this post, we will walk you through some of our projects and how we are planning to fit them into the Modern Web project.

## Guides

On our all-new [website](https://modern-web.dev), we have a dedicated [Guides](../../guides/index.md) section. It is meant to help you become confident in building for the modern web. It features step by step guides to work with our tools, and we document common issues developers run into when doing buildless development.

This section is a work in progress, we're looking to add more over time and would love your feedback and improvements. Feel free to hit "Edit this page on GitHub!", [open issues](https://github.com/modernweb-dev/web/issues/new) or [join the discussions](https://github.com/modernweb-dev/web/discussions).

## Web Test Runner

We are very excited to announce [web test runner](../../docs/test-runner/overview.md), one of the major projects we have been working on for the past months.

There are already a lot of testing solutions out there today. Unfortunately, all of them either run tests in Node.js and mock browser APIs using something like JSDom, or they don't support native es modules out of the box.

We think that making browser code compatible for testing in node is unnecessarily complex. Running tests in real browsers give greater confidence in (cross-browser) compatibility and makes writing and debugging tests more approachable.

That's why we created web test runner.

### Highlights

Some of the highlights of our test runner:

- Headless testing using [Puppeteer](../../docs/test-runner/browsers/puppeteer.md), [Playwright](../../docs/test-runner/browsers/playwright.md), or [Selenium](../../docs/test-runner/browsers/selenium.md). <br>
- Reports logs, 404s, and errors from the browser.
- Debug opens a real browser window with devtools.
- Mock ES modules via [Import Maps](../../docs/test-runner/writing-tests/mocking.md).
- Exposes browser properties like viewport size and dark mode.
- Runs tests in parallel and isolation.
- Interactive watch mode.
- Fast development by rerunning only changed tests.
- Powered by [esbuild](../../docs/dev-server/plugins/esbuild.md) and [rollup plugins](../../docs/dev-server/plugins/rollup.md).

### Getting started

There is a beta version of the test runner available today on NPM as `@web/test-runner`. It is almost feature-complete, we will have a v1 release soon!

If you want get started now take a look at our Web Test Runner [Getting Started Guide](../../guides/test-runner/getting-started.md).

## Web Dev Server

`es-dev-server` is the most popular package at Open Web Components, but it is not specific to web components alone. That's why we're working on its spiritual successor in the modern web project. We will call it web dev server, and it will be published as `@web/dev-server`.

If you're doing buildless development, you can use any web server for development. Our dev server helps out by providing developer productivity features and making your code compatible with older browsers.

### Highlights

- Acts like a real web server, without any flags it serves code untransformed to the browser.
- Efficient caching of unchanged files between reloads.
- Resolve bare module imports using `--node-resolve`.
- Auto reload on file changes with `--watch`.
- Compatibility with older browsers using `--esbuild-target`.
- Extensive [plugin system](../../docs/dev-server/plugins/overview.md).
- Integration with [esbuild](../../docs/dev-server/plugins/esbuild.md) for fast transformation of JS, TS and JSX.
- Reuse most [rollup plugins](../../docs/dev-server/plugins/rollup.md) in the dev server.
- Plugin for polyfilling [Import maps](../../docs/dev-server/plugins/import-maps.md) during development.

Our web dev server is not quite finished _yet_, but we've already built the basic parts to power our web test runner. This means that many of the listed features and plugins apply to our test runner as well.

We are working hard on finalizing the open tasks on web dev server so stay tuned for further updates.

## Building for production

While we try to avoid complex builds during development, they are still a requirement for production optimizations. Here too things can get pretty complex. Through plugins and guides, we will make it easier to integrate production builds with buildless development workflows.

A good example here is [@open-wc/rollup-plugin-html](https://www.npmjs.com/package/@open-wc/rollup-plugin-html) which we will move into the `@web` namespace. This plugin enables running rollup on an existing HTML page. Rollup will bundle and optimize any modules scripts found in the HTML. It works with single pages, but also with multiple pages, code-splitting and sharing common code between pages.

We plan to expand on this plugin further, adding support for optimizing assets such as images and CSS.

## Progressive web apps

When we talk about modern web apps, we also talk about _progressive_ web apps (PWA). PWAs are a great way to provide an engaging and user-friendly experience for your user, by allowing your app to work offline, and being able to install your web app on the user's home screen, among many other benefits.

Unfortunately, service workers are close to rocket science, and implementing PWA features isn't always as straightforward as it could be. That's why we'll provide technical guides and tools to make your life as a developer easier.

Not only do we ship [rollup-plugin-workbox](https://www.npmjs.com/search?q=rollup-plugin-workbox) to help you generate your service worker at build time, in the future, we will also have a set of zero dependency pwa-helpers as web components and vanilla javascript functions, as well as codelabs to help you get started building your modern, progressive web apps.

## Documentation (rocket)

In the past years, we've used different frameworks and tools to build our websites. Recently we've become big fans of [11ty](https://www.11ty.dev/). It's simple to use, works with markdown, and generates _just_ plain HTML. There is no runtime javascript involved to display page content, making it super fast.

To add interactivity to our page we started using web components and applied rollup with our plugins for [HTML](https://www.npmjs.com/package/@open-wc/rollup-plugin-html) and [workbox](https://www.npmjs.com/search?q=rollup-plugin-workbox).

This way our javascript is optimized and common code is shared between pages. Workbox adds a service worker, making our website available offline and precaches pages resulting is super fast navigation.

For a great content authoring experience, we integrated 11ty with our dev server. This adds features like resolving bare imports, and reloading the browser when files change.

By combining existing tools in this way, we think we've made something very powerful that will be useful for other people as well. That's why we started a child project in the modern web family, which we codenamed Rocket.

It's still in its early stages, but we're already using a prototype for our own [website](https://modern-web.dev). We're still missing some features, but we'll continue to evolve it, and an announcement will follow as soon as it's finished. So keep an eye out for it!

## Modern Web Family

Welp, that was a lot of information for a first announcement post — we realize, but many of these projects have been years in the making, and are finally finding their right home. As we mentioned before, Modern Web is all about making the life of developers easier, reducing the complexity of tools, and staying close to the browser.

While we have now spread out over multiple repositories like Open Web Components, Modern Web, and Rocket, we'd like to assure you that all of these projects fall under the same Modern Web Family, and aim to help make your life as developers easier.

## Thanks for reading

We are incredibly proud of what we have achieved so far and the direction we are heading and we invite you to join us on our path forward.

There is much, much more to come so follow us on [Twitter](https://twitter.com/modern_web_dev) and if you like what you see please consider sponsoring the project on [Open Collective](https://opencollective.com/modern-web).

Written with ♥️ by the Modern Web Core Team

---

<span>Photo by <a href="https://unsplash.com/@lemonvlad">Vladislav Klapin</a> on <a href="https://unsplash.com/s/photos/hello">Unsplash</a></span>
