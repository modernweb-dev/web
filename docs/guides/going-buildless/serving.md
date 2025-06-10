# Going Buildless >> Serving ||10

The fundamental relationship at the heart of the web is the relationship between the server and the client or browser (we'll use "browser" and "client" interchangeably for the rest of this article).

Every web page is produced by a server and viewed by a browser.
There are many different kinds of web servers and many different kinds of web browsers.
The client doesn't know everything about the server, and the server cannot control everything about the browser;
but the thing they both agree on is to communicate (at least initially) using
the [HyperText Transfer Protocol](https://developer.mozilla.org/en-US/docs/Web/HTTP), <dfn><abbr>HTTP</abbr></dfn>.

## Serving Web Content

Now that your `GET` request has reached the web server, the server has to parse the URL to determine what to include in the response.

So when the request for `GET https://my-domain.com/` comes in, the web server parses it into three major parts,

1. the protocol `https://`,
2. the domain name `my-domain.com`
3. the path `/`

So this particular request is asking for the entire web root directory since the path part of the URL didn't include any specific file in the request. How does the web server know how to respond? Most web servers when given a request for a directory will look for a special file in that directory named `index.html` and serve that. It's as if the user actually typed `https://my-domain.com/index.html` into their browser.

The simplest kinds of web servers retrieve the file located at the path specified in the URL, relative to the web root. The web root is the directory which that web server is configured to look in for files. For example, the [Apache](https://httpd.apache.org/) web server running on Ubuntu Linux 14.04 looks in `/var/www/html/` by default, whereas the nginx server by some default configurations looks in `/usr/share/nginx/html/`.

Just like on your computer, you can have as many pages and folders as you want in the web root

```
/
└── var
    └── www
        └── html
            ├── about
            │   ├── contact.html
            │   └── index.html
            ├── index.html
            └── help.html
```

This represents the default server root for Apache web server on linux.

| Page     | Url                                        | File                               |
| -------- | ------------------------------------------ | ---------------------------------- |
| Homepage | `https://my-domain.com/`                   | `/var/www/html/index.html`         |
| Help     | `https://my-domain.com/help.html`          | `/var/www/html/help.html`          |
| About    | `https://my-domain.com/about/`             | `/var/www/html/about/index.html`   |
| Contact  | `https://my-domain.com/about/contact.html` | `/var/www/html/about/contact.html` |

Now if you were to request `https://my-domain.com/main.html`, the server would send back the infamous "404 - File not found" error, since there's no `/main.html` file in the web root.
Likewise, if you were to rename `index.html` to `main.html`, then `https://my-domain.com/main.html` would work but `https://my-domain.com/` would give a "404".

### Files Outside the Web Root

In the above examples, the server used the default web root `/var/www/html`, but we could also have configured it to use `/var/www/html/about`, e.g. by changing into that directory and starting a server from the command line:

```
cd /var/www/html/about
http-server
```

If we did that, though, the server would not be able to read `help.html`.
The only files it can serve are:

```
.
├── contact.html
└── index.html
```

It will be important to keep this in mind when structuring your projects. In a buildless workflow, the web server will need to have all of your dependencies, including `node_modules` in its web root. So if you decide to keep your JavaScript code in a subdirectory of the project root, like `/src`, you will need to keep `index.html` in the root directory and run your local development server from there.

Just like how running `http-server` from `/about` made `help.html` inaccessible, running your local development server from `/src` would make `node_modules` inaccessible.

## Link Urls

The "HT" in <abbr>HTML</abbr>, "HyperText", refers to the way in which documents can link to other documents. This is the fundamental feature of <abbr>HTML</abbr> and the most important feature of the web.

Hyperlinks ("links" for short) in <abbr>HTML</abbr> are represented by the [anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a). The `href` attribute contains the URL which the hyperlink points to.

There are three basic types of URLs which you can link to:

1. [Fully-Qualified URLs](#fully-qualified-urls)
2. [Absolute Urls](#absolute-urls)
3. [Relative Urls](#relative-urls)

### Fully Qualified URLs

The most specific type of URL is the fully-qualified URL. They contain a protocol; zero, one, or more subdomains; a domain name; and an optional path. They refer specifically to a single, unique resource. Some examples:

- `https://www.google.com`
- `https://modern-web.dev/guides/going-buildless/serving/`
- `ws://demos.kaazing.com/echo`

Links with fully qualified URLs can link a page on your server, to pages on another server. This is what puts the "world-wide" in "world-wide-web". All the links to [MDN](https://developer.mozilla.org) in this article are like that.

```html
<a href="https://google.com/">if you click me I will open google</a>
```

Because the URL is fully-qualified, adding that `<a>` tag to any page anywhere on the web will have the same behavior[^1], namely opening google's home page.

[^1]: Assuming that the page doesn't use JavaScript or other techniques to surreptitiously change the destination of the link

### Absolute URLs

Absolute URLs contain only a path, omitting the protocol and origin. They always begin with `/`. Like fully-qualified URLs, they always refer to the same path relative to the origin, for example:

```html
<a href="/index.html">Home Page</a>
```

This link will have the same behaviour on all pages on `modern-web.dev`, namely returning to the Modern Web homepage. but if placed on `developer.mozilla.org`, will link to the MDN homepage, not Modern Web's.

Absolute links containing _only_ a `/` are special, they refer to the web root. In most cases, they are synonymous with `/index.html`.

### Relative URLs

The least specific type of URL is a relative URL. Like absolute URLs, they omit the protocol and origin, but unlike absolute URLs, which contain a full path, relative URLs contain a partial, or relative path. They start with `./`, `../`, or a path to a resource. for example:

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

## Learn more

If you wanna know more check out MDN's [HTML basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics).
