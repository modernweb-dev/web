---
title: Servers and Clients
eleventyNavigation:
  key: Servers and Clients
  parent: Web Development
  order: 10
---

The fundamental relationship at the heart of the web is the relationship between the server and the client or browser (we'll use "browser" and "client" interchangeably for the rest of this article).

Every web page is produced by a server and viewed by a browser.
There are many different kinds of web servers and many different kinds of web browsers.
The client doesn't know everything about the server, and the server cannot control everything about the browser;
but the thing they both agree on is to communicate (at least initially) using
the [HyperText Transfer Protocol](https://developer.mozilla.org/en-US/docs/Web/HTTP), <dfn><abbr>HTTP</abbr></dfn>.

## URLs

Every resource on the web, whether it's a web page, an image, a video, a [CSS stylesheet](./css.md), some [JavaScript](./javascript.md), or anything else, is accesible via a Uniform Resource Locator, or <dfn><abbr>URL</abbr></dfn>.

A URL (specifically, a ["fully-qualified"](../html/#fully-qualified-urls) URL) contains three parts

1. A protocol, e.g. `https`
2. An origin e.g. `developer.mozilla.org`
3. An (optional) path , e.g. `/en-US/docs/Web/API/MutationObserver`

The protocol tells the server how to respond, the origin (containing a domain name and zero, one, or more subdomains) identifies the server to request, and the path specifies the resource to access.

When your browser visits a web page, it essentially asks the server responsible for that page
for an HTML document, which may or may not link to other resources like images, CSS stylesheets or
JavaScript. The browser accesses each of those resources using an [HTTP `GET` request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET). The web server's primary job is to provide that HTML document and its sub-resources to the browser.

For example, when you visited this web page, your browser sent a `GET https://modern-web.dev/docs/learn/standards-based/servers-and-clients/` request

## DNS

Before your `GET` request even reaches the server though, it travels through the **Domain Name System**, or <abbr>DNS</abbr>.

Every web servers has an [IP address](https://developer.mozilla.org/en-US/docs/Glossary/IP_Address),
a unique identifier typically composed of four numbers, each ranging from 0 to 255 e.g. `1.2.3.4`.
Think of an IP address like the street address of a business that only operates via mail.
If you want to conduct business with them, you must visit them at their street address.
Similarly, you must know a web server's IP address if you want to access any of its resources.

IP addresses were useful for computers, but difficult for people to remember and deal with,
so in 1983 Paul Mockapetris and the Internet Engineering Task force invented and implemented the DNS. That way, web server owners could register a human-readable domain name like
`modern-web.dev` that points to their IP address. You can think of the DNS as a vast distributed
table of domain names and their associated IP addresses.

| Name           | IP      |
| -------------- | ------- |
| google.com     | 1.2.3.4 |
| modern-web.dev | 1.3.4.5 |

That way, when you type `modern-web.dev` into your
web browser, what you're actually doing is sending a GET request to the IP address _for_ `modern-web.dev`.

For more information of how the DNS works at a high level, check out the [computerphile video series on DNS](https://www.youtube.com/watch?v=uOfonONtIuk)

### `localhost`

While developing websites, common practise is to start a web server on your local development machine to test out the site, before deploying it to it's production server. Assigning a domain name to your current IP address would be tedious, especially considering that most residential ISPs assign dynamic IP addresses which change every few hours or days, and most office PCs are behind some kind of [NAT](https://www.wikiwand.com/en/Network_address_translation), which assigns them a private, local IP instead of their actual internet-facing IP address.

DNS reserves the special domain name `localhost` to refer to the device that is making the request, in our case, whatever machine you happen to be working on at the time. Operating Systems assign that name to the [loopback](https://www.wikiwand.com/en/Localhost#/Loopback) address `127.0.0.1` in the `hosts` file.

The following commands create a directory `test-server` inside the home directory, add a file there called `index.html` containing the text "Hello, World!", then launch a local web server on port 8000 that opens the default browser.

Run these commands on a UNIX-like operating system (GNU/Linux, macOS, WSL) that has nodejs installed, and you'll see a page containing the text "Hello, World!"

```
mkdir ~/test-server
cd ~/test-server
echo "Hello, World!" > index.html
npx es-dev-server -p 8000 --open .
```

## Serving Web Content

Now that your `GET` request has reached the web server, the server has to parse the URL to determine what to include in the response.

So when the request for `GET https://my-domain.dev/` comes in, the web server parses it into three major parts,

1. the protocol `https://`,
2. the domain name `my-domain.dev`
3. the path `/`

So this particular request is asking for the entire web root directory since the path part of the URL didn't include any specific file in the request. How does the web server know how to respond? Most web servers when given a request for a directory will look for a special file in that directory named `index.html` and serve that. It's as if the user actually typed `https://my-domain.dev/index.html` into their browser.

The simplest kinds of web servers simply retrieve the file located at the path specified in the URL, relative to the web root. The web root is just the directory which that web server is configured to look in for files. For example, the [Apache](https://httpd.apache.org/) web server running on Ubuntu Linux 14.04 looks in `/var/www/html/` by default, whereas the nginx server by some default configurations looks in `/usr/share/nginx/html/`.

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

Now if you where to request `https://my-domain.com/main.html`, the server would send back the infamous "404 - File not found" error, since there's no `/main.html` file in the web root.
Likewise, if you were to rename `index.html` to `main.html`, then `https://my-domain.com/help.html` would work but `https://my-domain.com/` would give a "404".

### Files Outside the Web Root

In the above examples, the server used the default web root `/var/www/html`, but we could just as easily have configured it to use `/var/www/html/about`, e.g. by changing into that directory and starting a server from the command line

```
cd /var/www/about
http-server
```

If we did that, though, the server would not be able to read `help.html`.
The only files it can serve are:

```
.
├── contact.html
└── index.html
```

It will be important to keep this in mind when structuring your projects. In a [buildless](#) workflow, the web server will need to have all of your dependencies, including `node_modules` in its web root. So if you decide to keep your JavaScript code in a subdirectory of the project root, like `/src`, you will need to keep `index.html` in the root directory and run your local development server from there.

Just like how running `http-server` from `/about` made `help.html` inaccessible, running your local development server from `/src` would make `node_modules` inaccessible.

## Learn more

!TODO: Link for more details???
