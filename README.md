# URLPackage

Portable, remixable packages of links: playlists for the web.

This repository contains:

- `schema/urlpackage.schema.json` — draft JSON Schema for `.urlpackage.json`
- `examples/` — valid example packages
- `src/` — static GitHub Pages viewer/editor
- `docs/spec.md` — format notes and interoperability goals

## Use

Open the GitHub Pages site to create a portable link package:

- describe the collection with title, version, description, cover image, and icon;
- add links with title, description, image, tags, notes, status, and last-known-good timestamp;
- preview how a client could present it;
- export as `.urlpackage.json`, Markdown, bookmarks HTML, or a static HTML page.

The page can also load a package from a direct URL when the host allows browser CORS.

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
