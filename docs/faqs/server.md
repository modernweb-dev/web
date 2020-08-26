## URLs

Every resource on the web, whether it's a web page, an image, a video, a [CSS stylesheet](./css.md), some [JavaScript](./javascript.md), or anything else, is accesible via a Uniform Resource Locator, or <dfn><abbr>URL</abbr></dfn>.

A URL (specifically, a ["fully-qualified"](./html.md#fully-qualified-urls) URL) contains three parts

1. A protocol, e.g. `https`
2. An origin e.g. `developer.mozilla.org`
3. An (optional) path , e.g. `/en-US/docs/Web/API/MutationObserver`

The protocol tells the server how to respond, the origin (containing a domain name and zero, one, or more subdomains) identifies the server to request, and the path specifies the resource to access.

When your browser visits a web page, it essentially asks the server responsible for that page
for an HTML document, which may or may not link to other resources like images, CSS stylesheets or
JavaScript. The browser accesses each of those resources using an [HTTP `GET` request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET). The web server's primary job is to provide that HTML document and its sub-resources to the browser.

For example, when you visited this web page, your browser sent a `GET https://modern-web.dev/docs/guides/standards-based/servers-and-clients/` request

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
