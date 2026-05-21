# URLPackage

Portable, remixable packages of links: playlists for the web.

This repository contains:

- `schema/urlpackage.schema.json` — draft JSON Schema for `.urlpackage.json`
- `examples/` — valid example packages
- `src/` — static GitHub Pages viewer/editor
- `docs/spec.md` — format notes and interoperability goals

## Use

Open the GitHub Pages site, paste or upload a package, edit links and metadata, validate it, then export JSON.

## Format

The simplest package is:

```json
{
  "urlpackage": "0.1",
  "title": "Starter links",
  "links": [{ "url": "https://example.com" }]
}
```

Richer packages may include descriptions, images, authors, tags, versions, and per-link metadata.
