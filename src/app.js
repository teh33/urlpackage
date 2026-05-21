const example = {
  urlpackage: "0.1",
  id: "dev.urlpackage.web-playlists",
  title: "Web Playlists Starter Kit",
  description: "A short pack of links about portable web collections and open formats.",
  version: "0.1.0",
  image: "",
  icon: "",
  tags: ["open-web", "bookmarks", "curation"],
  links: [
    { url: "https://www.w3.org/TR/appmanifest/", title: "Web Application Manifest", description: "A related W3C format for describing presentation metadata.", image: "", tags: ["standard", "metadata"], status: "ok", lastKnownGood: "2026-05-21T00:00:00Z" },
    { url: "https://en.wikipedia.org/wiki/OPML", title: "OPML", description: "An older XML outline format often used for exchanging feeds and lists.", image: "", tags: ["prior-art"], status: "ok" },
    { url: "https://json-schema.org/", title: "JSON Schema", description: "The validation language used by this draft package format.", image: "", tags: ["validation"], status: "ok" }
  ]
};

let pack = structuredClone(example);
const $ = (id) => document.getElementById(id);
const optional = (value) => value && String(value).trim();

function splitTags(value) {
  return value.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function validatePackage(value) {
  const errors = [];
  if (value.urlpackage !== "0.1") errors.push("urlpackage must be 0.1");
  if (!value.title || typeof value.title !== "string") errors.push("title is required");
  if (!Array.isArray(value.links) || value.links.length === 0) errors.push("at least one link is required");
  for (const [index, link] of (value.links || []).entries()) {
    try { new URL(link.url); } catch { errors.push(`link ${index + 1} needs an absolute URL`); }
  }
  return errors;
}

function cleanObject(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => Array.isArray(value) ? value.length : optional(value)));
}

function readForm() {
  pack = cleanObject({
    ...pack,
    urlpackage: "0.1",
    title: $("title").value.trim(),
    description: $("description").value.trim(),
    version: $("version").value.trim(),
    image: $("image").value.trim(),
    icon: $("icon").value.trim(),
    updatedAt: new Date().toISOString(),
    links: [...document.querySelectorAll(".link-row")].map((row) => cleanObject({
      url: row.querySelector(".url").value.trim(),
      title: row.querySelector(".link-title").value.trim(),
      description: row.querySelector(".link-description").value.trim(),
      image: row.querySelector(".link-image").value.trim(),
      tags: splitTags(row.querySelector(".tags").value),
      lastKnownGood: row.querySelector(".last-known-good").value ? new Date(row.querySelector(".last-known-good").value).toISOString() : "",
      status: row.querySelector(".status").value,
      notes: row.querySelector(".notes").value.trim()
    }))
  });
}

function renderEditor() {
  $("title").value = pack.title || "";
  $("description").value = pack.description || "";
  $("version").value = pack.version || "";
  $("image").value = pack.image || "";
  $("icon").value = pack.icon || "";
  $("links").innerHTML = "";
  for (const link of pack.links || []) addLinkRow(link, false);
  renderOutput();
}

function addLinkRow(link = { url: "", title: "", description: "", tags: [] }, shouldRender = true) {
  const row = document.createElement("div");
  row.className = "link-row";
  const number = document.querySelectorAll(".link-row").length + 1;
  row.innerHTML = `<div class="row-head"><strong>${number}</strong><button class="remove" type="button" aria-label="Remove link ${number}">Remove</button></div>
    <label>Website URL<input class="url" value="${escapeAttr(link.url || "")}" placeholder="https://example.com"></label>
    <label>Display title<input class="link-title" value="${escapeAttr(link.title || "")}" placeholder="Example article"></label>
    <label>Why include it?<textarea class="link-description" rows="2" placeholder="A short note that helps someone understand this link.">${escapeHtml(link.description || "")}</textarea></label>
    <div class="split"><label>Link image URL<input class="link-image" value="${escapeAttr(link.image || "")}" placeholder="https://..."></label><label>Last-known-good<input class="last-known-good" type="datetime-local" value="${dateTimeLocal(link.lastKnownGood)}"></label></div>
    <div class="split"><label>Status<select class="status"><option>unknown</option><option>ok</option><option>redirected</option><option>broken</option><option>archived</option></select></label><label>Tags<input class="tags" value="${escapeAttr((link.tags || []).join(", "))}" placeholder="research, design"></label></div>
    <label>Notes<textarea class="notes" rows="2" placeholder="Private or public notes about this link.">${escapeHtml(link.notes || "")}</textarea></label>`;
  row.querySelector(".status").value = link.status || "unknown";
  row.querySelector(".remove").addEventListener("click", () => { row.remove(); renumberLinks(); renderOutputFromForm(); });
  row.querySelectorAll("input, textarea, select").forEach((input) => input.addEventListener("input", renderOutputFromForm));
  $("links").append(row);
  if (shouldRender) renderOutputFromForm();
}

function renumberLinks() {
  document.querySelectorAll(".link-row").forEach((row, index) => {
    const number = index + 1;
    row.querySelector(".row-head strong").textContent = number;
    row.querySelector(".remove").setAttribute("aria-label", `Remove link ${number}`);
  });
}

function renderOutputFromForm() { readForm(); renderOutput(); }

function renderOutput() {
  const errors = validatePackage(pack);
  $("status").textContent = errors.length ? errors.join(" · ") : "Valid draft 0.1";
  $("count").textContent = `${(pack.links || []).length} links · ${(new Blob([JSON.stringify(pack)])).size} bytes`;
  $("json").value = JSON.stringify(pack, null, 2);
  $("preview").innerHTML = `<div class="card">${pack.image ? `<img class="cover image-cover" src="${escapeAttr(pack.image)}" alt="">` : `<div class="cover">↗</div>`}<div class="card-body"><div class="package-title">${pack.icon ? `<img src="${escapeAttr(pack.icon)}" alt="">` : ""}<h2>${escapeHtml(pack.title || "Untitled package")}</h2></div><p class="meta">${escapeHtml(pack.description || "No description yet.")}</p>${pack.version ? `<p class="meta">Version ${escapeHtml(pack.version)}</p>` : ""}${(pack.tags || []).map(tag).join("")}</div>${(pack.links || []).map(previewLink).join("")}</div>`;
}

function previewLink(link) {
  const note = link.lastKnownGood ? `Last known good: ${new Date(link.lastKnownGood).toLocaleDateString()}` : link.url || "";
  return `<a class="preview-link" href="${escapeAttr(link.url || "#")}" target="_blank" rel="noreferrer">${link.image ? `<img src="${escapeAttr(link.image)}" alt="">` : ""}<span><strong>${escapeHtml(link.title || link.url || "Untitled link")}</strong><span class="meta">${escapeHtml(link.description || note)}</span><small>${escapeHtml(note)}</small><div>${(link.tags || []).map(tag).join("")}</div></span></a>`;
}

function download(name, type, text) {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function filename(extension) {
  const slug = (pack.title || "package").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "package";
  return `${slug}${extension}`;
}

function toMarkdown() {
  return `# ${pack.title || "Untitled package"}\n\n${pack.description || ""}\n\n${(pack.links || []).map((link) => `- [${link.title || link.url}](${link.url})${link.description ? ` — ${link.description}` : ""}`).join("\n")}\n`;
}

function toBookmarksHtml() {
  return `<!doctype NETSCAPE-Bookmark-file-1>\n<meta charset="utf-8">\n<title>${escapeHtml(pack.title || "URLPackage")}</title>\n<h1>${escapeHtml(pack.title || "URLPackage")}</h1>\n<dl><p>\n${(pack.links || []).map((link) => `  <dt><a href="${escapeAttr(link.url)}">${escapeHtml(link.title || link.url)}</a>\n  <dd>${escapeHtml(link.description || "")}`).join("\n")}\n</dl>\n`;
}

function toStaticPage() {
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(pack.title || "URLPackage")}</title><style>body{font:16px/1.5 system-ui;max-width:760px;margin:40px auto;padding:0 18px}a{color:inherit}.link{border-top:1px solid #ddd;padding:14px 0}.muted{color:#666}</style><h1>${escapeHtml(pack.title || "Untitled package")}</h1><p class="muted">${escapeHtml(pack.description || "")}</p>${(pack.links || []).map((link) => `<div class="link"><h2><a href="${escapeAttr(link.url)}">${escapeHtml(link.title || link.url)}</a></h2><p>${escapeHtml(link.description || "")}</p></div>`).join("")}`;
}

function tag(value) { return `<span class="tag">${escapeHtml(value)}</span>`; }
function dateTimeLocal(value) { return value ? new Date(value).toISOString().slice(0, 16) : ""; }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#96;"); }

["title", "description", "version", "image", "icon"].forEach((id) => $(id).addEventListener("input", renderOutputFromForm));
$("add-link").addEventListener("click", () => addLinkRow());
$("load-example").addEventListener("click", () => { pack = structuredClone(example); renderEditor(); });
$("json").addEventListener("input", () => {
  try { pack = JSON.parse($("json").value); renderEditor(); } catch (error) { $("status").textContent = error.message; }
});
$("file").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  pack = JSON.parse(await file.text());
  renderEditor();
});
$("load-url").addEventListener("click", async () => {
  const url = $("package-url").value.trim();
  if (!url) return;
  $("status").textContent = "Loading URL…";
  pack = await fetch(url).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
  renderEditor();
});
$("download-json").addEventListener("click", () => { readForm(); download(filename(".urlpackage.json"), "application/json", JSON.stringify(pack, null, 2) + "\n"); });
$("download-markdown").addEventListener("click", () => { readForm(); download(filename(".md"), "text/markdown", toMarkdown()); });
$("download-bookmarks").addEventListener("click", () => { readForm(); download(filename(".bookmarks.html"), "text/html", toBookmarksHtml()); });
$("download-page").addEventListener("click", () => { readForm(); download(filename(".html"), "text/html", toStaticPage()); });

renderEditor();
