---
title: Servers and Clients
eleventyNavigation:
  key: Servers and Clients
  parent: Standards-Based
  order: 10
---

The fundamental relationship at the heart of the web is the relationship between the server and the client or browser (we'll use "browser" and "client" interchangeably for the rest of this article).

Every web page is produced by a server and viewed by a browser.
There are many different kinds of web servers and many different kinds of web browsers.
The client doesn't know everything about the server, and the server cannot control everything about the browser;
but the thing they both agree on is to communicate (at least initially) using
<a href="https://developer.mozilla.org/en-US/docs/Web/HTTP" target="_blank" rel="noopener noreferrer"><abbr title="HyperText Transfer Protocol">HTTP</abbr></a>.

## URLs

Every resource on the web, whether it's a web page, an image, a video, a CSS stylesheet, some JavaScript code, or anything else, is accesible via a <abbr>URL</abbr> or Uniform Resource Locator.

When your browser visits a web page, it is essentially asking the server responsible for that page
for an HTML document, which may or may not link to other resources like images, [CSS stylesheets](./css.md) or
[JavaScript](./javascript.md). Each of those resources is accessed using an HTTP "`GET`" request. The web server's primary job is to provide that HTML document and its sub-resources to the browser.

For example, when you visit this web page, your browser sent a `GET https://modern-web.dev/docs/learn/standards-based/servers-and-clients/` request

## DNS

Before your `GET` request even reaches the server though, it travels through the **Domain Name System**, or <abbr>DNS</abbr>.

Every web servers has an [IP address](https://developer.mozilla.org/en-US/docs/Glossary/IP_Address),
a unique identifier typically composed of four numbers, each ranging from 0 to 255 e.g. `1.2.3.4`.
Think of an IP address just like the street address of a business that only operates via mail.
If you want to conduct business with them, the only way to do it is through their street address.
Similarly, the only way to access a web server is via its IP address.

IP addresses are useful for computers, but difficult for people to remember and deal with,
so the DNS was implemented to allows web server owners to register a human-readable domain name like
`modern-web.dev` that points to their IP address. You can think of the DNS as a vast distributed
table of domain names and their associated IP addresses.

| Name           | IP      |
| -------------- | ------- |
| google.com     | 1.2.3.4 |
| modern-web.dev | 1.3.4.5 |

That way, when you type `modern-web.dev` into your
web browser, what you're actually doing is sending a GET request to the IP address _for_ `modern-web.dev`.

For more information of how the DNS works at a high level, check out the [computerphile video series on DNS](https://www.youtube.com/watch?v=uOfonONtIuk)

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

## Links to outside of your server

Give the following folder structure on the server

However especially when working with local web servers for development we can easily set the server root to `/var/www/about/` for example.
We can do this by starting a server within the folder. Typically it looks something like this

```bash
cd /var/www/about
http-server
```

This however means that every file outside of my server root is NOT accessible to it.

For the server all the files it sees are

```
.
├── contact.html
└── index.html
```

In this case `help.html` can not be accessed by anyone.

## Local development with localhost

While developing on your local development machine it would be a lot of effort to have a domain name point to your current IP. Especially as most of us will only get a dynamic IP (which changes every few hours/days).

To ease that pain there is a special domain called `localhost` which usually points to `127.0.0.1` which is a special IP that always point to your own machine.

Therefore while developing it makes sense to start your web server locally and then open `http://localhost`.

Each server has a specific name like `my-domain.com`.

## Learn more

!TODO: Link for more details???
