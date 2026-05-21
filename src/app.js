const example = {
  urlpackage: "0.1",
  id: "dev.urlpackage.web-playlists",
  title: "Web Playlists Starter Kit",
  description: "A short pack of links about portable web collections and open formats.",
  version: "0.1.0",
  image: "",
  tags: ["open-web", "bookmarks", "curation"],
  links: [
    { url: "https://www.w3.org/TR/appmanifest/", title: "Web Application Manifest", description: "A related W3C format for describing web app presentation metadata.", tags: ["standard", "metadata"], status: "ok" },
    { url: "https://en.wikipedia.org/wiki/OPML", title: "OPML", description: "An older XML outline format often used for exchanging feeds and lists.", tags: ["prior-art"], status: "ok" },
    { url: "https://json-schema.org/", title: "JSON Schema", description: "The validation language used by this draft package format.", tags: ["validation"], status: "ok" }
  ]
};

let pack = structuredClone(example);
const $ = (id) => document.getElementById(id);

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

function readForm() {
  pack.title = $("title").value.trim();
  pack.description = $("description").value.trim();
  pack.version = $("version").value.trim();
  pack.image = $("image").value.trim();
  pack.updatedAt = new Date().toISOString();
  pack.links = [...document.querySelectorAll(".link-row")].map((row) => ({
    url: row.querySelector(".url").value.trim(),
    title: row.querySelector(".link-title").value.trim(),
    description: row.querySelector(".link-description").value.trim(),
    tags: splitTags(row.querySelector(".tags").value),
    status: "unknown"
  })).map((link) => Object.fromEntries(Object.entries(link).filter(([, value]) => Array.isArray(value) ? value.length : value)));
}

function renderEditor() {
  $("title").value = pack.title || "";
  $("description").value = pack.description || "";
  $("version").value = pack.version || "";
  $("image").value = pack.image || "";
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
    <label>Tags<input class="tags" value="${escapeAttr((link.tags || []).join(", "))}" placeholder="research, design"></label>`;
  row.querySelector(".remove").addEventListener("click", () => { row.remove(); renumberLinks(); renderOutputFromForm(); });
  row.querySelectorAll("input, textarea").forEach((input) => input.addEventListener("input", renderOutputFromForm));
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
  $("count").textContent = `${(pack.links || []).length} links`;
  $("json").value = JSON.stringify(pack, null, 2);
  $("preview").innerHTML = `<div class="card">${pack.image ? `<img class="cover" src="${escapeAttr(pack.image)}" alt="">` : `<div class="cover">↗</div>`}<div class="card-body"><h2>${escapeHtml(pack.title || "Untitled package")}</h2><p class="meta">${escapeHtml(pack.description || "No description yet.")}</p>${(pack.tags || []).map(tag).join("")}</div>${(pack.links || []).map(previewLink).join("")}</div>`;
}

function previewLink(link) {
  return `<a class="preview-link" href="${escapeAttr(link.url || "#")}" target="_blank" rel="noreferrer"><strong>${escapeHtml(link.title || link.url || "Untitled link")}</strong><span class="meta">${escapeHtml(link.description || link.url || "")}</span><div>${(link.tags || []).map(tag).join("")}</div></a>`;
}
function tag(value) { return `<span class="tag">${escapeHtml(value)}</span>`; }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#96;"); }

["title", "description", "version", "image"].forEach((id) => $(id).addEventListener("input", renderOutputFromForm));
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
$("download").addEventListener("click", () => {
  readForm();
  const blob = new Blob([JSON.stringify(pack, null, 2) + "\n"], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(pack.title || "package").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "package"}.urlpackage.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

renderEditor();
