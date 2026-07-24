# Neulogic Solutions — Marketing Site

Static marketing site for Neulogic Solutions (Symplus), an integrated platform for
asset managers, brokers, trustees, and lenders across Africa.

## How it's built

Every page is generated from a single source of truth, [`build.js`](build.js), into
static HTML. Shared styles live in [`assets/css/styles.css`](assets/css/styles.css) and
shared behavior in [`assets/js/main.js`](assets/js/main.js).

```bash
node build.js
```

This regenerates all pages (homepage, six-plus-two solution pages, security & compliance,
case studies, partners, about, implementation, request-a-demo, insights + articles,
careers). No build dependencies — `build.js` uses only Node built-ins.

## Local preview

Serve the folder over HTTP and open it in a browser:

```bash
python -m http.server 8123
```

Then visit http://localhost:8123.

## Content status

Some sections still contain clearly-marked placeholder or dummy content pending real,
approved input. Search the source for `data-placeholder`, `data-review`, and bracketed
`[...]` text to find everything that must be replaced before the site goes live.
Case-study narratives that name real clients must not be published until each client has
signed off on the framing.
