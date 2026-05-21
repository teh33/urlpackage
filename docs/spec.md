# URLPackage draft 0.1

A URLPackage is a portable JSON document that describes a curated list of web links plus presentation metadata.

## Goals

- Human-readable and easy to hand-edit.
- Works as a plain `.urlpackage.json` file.
- Can later be embedded in a `.urlpackage` zip bundle with images and cached metadata.
- Imports and exports cleanly to bookmarks HTML, Markdown, OPML, and static web pages.
- Useful for humans and agents: research packs, learning kits, source bundles, tab sets, and public collections.

## Required fields

- `urlpackage`: format version string. Current draft: `0.1`.
- `title`: package title.
- `links`: non-empty array of link objects.

Each link must have a valid absolute `url`.

## Optional package fields

- `id`
- `description`
- `version`
- `image`
- `icon`
- `homepage`
- `createdAt`
- `updatedAt`
- `authors`
- `tags`
- `license`
- `source`

## Optional link fields

- `title`
- `description`
- `image`
- `icon`
- `tags`
- `addedAt`
- `updatedAt`
- `lastKnownGood`
- `status`
- `notes`

## File extensions

- `.urlpackage.json`: canonical plain JSON form.
- `.urlpackage`: reserved for a future zip container with `manifest.json` and assets.
