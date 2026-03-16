# vite-plugin-htjs-pages

[![npm
version](https://img.shields.io/npm/v/vite-plugin-htjs-pages.svg)](https://www.npmjs.com/package/vite-plugin-htjs-pages)
[![npm
downloads](https://img.shields.io/npm/dm/vite-plugin-htjs-pages.svg)](https://www.npmjs.com/package/vite-plugin-htjs-pages)
[![license](https://img.shields.io/npm/l/vite-plugin-htjs-pages.svg)](LICENSE)
[![vite](https://img.shields.io/badge/vite-plugin-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

Minimal **static site generation (SSG) for Vite** using JavaScript
functions that return HTML.

Generate static HTML pages from `*.ht.js` modules using Vite and
[`javascript-to-html`](https://www.npmjs.com/package/javascript-to-html).

⭐ If this project helps you, please consider starring it.

------------------------------------------------------------------------

## Built for the Vite ecosystem

Works seamlessly with:

-   ⚡ **Vite**
-   📦 **Rollup / Rolldown**
-   🧩 **javascript-to-html**

A minimal **static site generator for Vite** that keeps pages as simple
JavaScript functions returning HTML.

------------------------------------------------------------------------

# Features

-   File‑based routing
-   Dynamic routes (`[slug].ht.js`)
-   Catch‑all routes (`[...slug].ht.js`)
-   Static params generation (`generateStaticParams()`)
-   Dev server SSR rendering
-   Clean URL support
-   Parallel batched page rendering
-   Automatic `404.html`
-   Automatic `sitemap.xml`
-   Optional `rss.xml` generation
-   Debug mode for easier troubleshooting

------------------------------------------------------------------------

## TL;DR

Write:

```js
// src/index.ht.js

import { fragment, html, body, head, title, h1 } from 'javascript-to-html'

export default () => fragment(
  '<!doctype html>',
  html({lang: "en"},
    head(
      title("My website")
    ),
    body(
      h1('Hello world')
    )
  )
)
```

Run: 

``` bash
vite build
```

Get:

```html
<!-- dist/index.html -->
 
<!doctype html>
<html lang="en">
  <head>
    <title>My website</title>
  </head>
  <body>
    <h1>Hello world</h1>
  </body>
</html>
```

------------------------------------------------------------------------

# Why this exists

Modern static site tools are powerful, but they often introduce:

-   frameworks
-   component systems
-   complex build pipelines
-   opinionated conventions

Sometimes you just want to:

-   write HTML
-   organize pages in folders
-   generate static files

`vite-plugin-htjs-pages` exists for that use case.

It gives you:

-   file‑based routing
-   dynamic pages
-   static generation
-   dev server rendering

while keeping pages as **simple JavaScript functions that return HTML**.

------------------------------------------------------------------------

# How it works

    src/index.ht.js
    src/blog/[slug].ht.js
            │
            ▼
     vite-plugin-htjs-pages
            │
            ▼
    dist/index.html
    dist/blog/hello-world/index.html

Pages are just **JavaScript functions that return HTML**.

------------------------------------------------------------------------

# Installation

``` bash
npm install vite-plugin-htjs-pages javascript-to-html
```

------------------------------------------------------------------------

# Quick Start

### 1. Configure Vite

``` js
import { defineConfig } from 'vite'
import { htPages } from 'vite-plugin-htjs-pages'

export default defineConfig({
  plugins: [htPages()]
})
```

### 2. Create a page

    src/index.ht.js

``` js
import { fragment, html, head, body, title, h1 } from 'javascript-to-html'

export default () => fragment(
  '<!doctype html>',
  html(
    head(
      title('Hello world')
    ),
    body(
      h1('Hello world')
    )
  )
)
```

### 3. Run dev server

``` bash
vite
```

### 4. Build

``` bash
vite build
```

Output:

    dist/index.html

------------------------------------------------------------------------

# File‑Based Routing

Routes are derived from the filesystem.

    src/

      index.ht.js
      about.ht.js

      blog/
        [slug].ht.js

      docs/
        [...slug].ht.js

Produces:

    /index.html
    /about/index.html
    /blog/hello-world/index.html
    /docs/getting-started/index.html

------------------------------------------------------------------------

# Dynamic Routes

    src/blog/[slug].ht.js

``` js
import { fragment, html, body, h1 } from 'javascript-to-html'

export function generateStaticParams() {
  return [
    { slug: 'hello-world' },
    { slug: 'deep-dive' }
  ]
}

export default ({ params }) => fragment(
  '<!doctype html>',
  html(
    body(
      h1(params.slug)
    )
  )
)
```

------------------------------------------------------------------------

# Data Loading

Pages can export a `data()` function.

``` js
export async function data({ params }) {
  return {
    title: params.slug
  }
}
```

------------------------------------------------------------------------

# Layouts

Reusable layout functions work naturally with HT.js.

``` js
import { fragment, html, head, body } from 'javascript-to-html'

export default (...content) => fragment(
  '<!doctype html>',
  html(
    head(),
    body(
      ...content
    )
  )
)
```

------------------------------------------------------------------------

# Plugin Options

``` js
htPages({
  cleanUrls: true,
  renderConcurrency: 8,
  renderBatchSize: 64
})
```

| Option | Description |
|------|------|
| `pagesDir` | root directory for pages |
| `include` | page glob pattern |
| `exclude` | excluded patterns |
| `cleanUrls` | `/page/index.html` instead of `/page.html` |
| `renderConcurrency` | concurrent page renders |
| `renderBatchSize` | render batch size |
| `debug` | enable debug logging |
| `site` | base URL used for sitemap |
| `rss` | configuration for RSS feed |

------------------------------------------------------------------------

# Debug Mode

Enable debug logs when troubleshooting builds or routing.

``` js
htPages({
  debug: true
})
```

Example output:

    [vite-plugin-htjs-pages] discovered entries [...]
    [vite-plugin-htjs-pages] dev pages [...]
    [vite-plugin-htjs-pages] render bundle ...

This helps diagnose routing or build issues without modifying plugin
code.

------------------------------------------------------------------------

# Automatic Sitemap

The plugin automatically generates:

    dist/sitemap.xml

Example:

``` xml
<urlset>
  <url><loc>/</loc></url>
  <url><loc>/blog/hello-world</loc></url>
</urlset>
```

If you configure a `site` option, URLs become absolute:

``` js
htPages({
  site: "https://example.com"
})
```

------------------------------------------------------------------------

# Automatic RSS Feed

Optional RSS feed generation for blogs.

``` js
htPages({
  rss: {
    site: "https://example.com",
    title: "My Blog",
    description: "Latest posts",
    routePrefix: "/blog"
  }
})
```

This generates:

    dist/rss.xml

Example item:

``` xml
<item>
  <title>/blog/hello-world</title>
  <link>https://example.com/blog/hello-world</link>
</item>
```

------------------------------------------------------------------------

# Performance Tips

Large sites (500+ pages):

``` js
htPages({
  renderConcurrency: 16,
  renderBatchSize: 128
})
```

This keeps memory usage stable during large builds.

------------------------------------------------------------------------

# Use Cases

`vite-plugin-htjs-pages` works well for:

-   **Vite static site generation**
-   **File-based routing with Vite**
-   **Generating static HTML with Vite**
-   **Vite blog generators**
-   **Documentation sites**
-   **Minimal static site generators**
-   **HTML‑first Vite projects**

------------------------------------------------------------------------

# Comparison

| Tool | Focus |
|-----|-----|
| Astro | component framework |
| Next.js | SSR framework |
| vite-plugin-htjs-pages | minimal static HTML generation |

------------------------------------------------------------------------

# License

MIT
