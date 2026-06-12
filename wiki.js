/**
 * wiki.js — Shattered Wiki frontend
 *
 * Responsibilities:
 *   - Open wiki.db via sql.js-httpvfs (range-request SQLite)
 *   - Render the header (desktop + mobile, responsive)
 *   - Route page requests from the URL (?page=slug)
 *   - Parse Markdown + YAML front matter into HTML
 *   - Validate internal [[wiki-links]] against the database
 */

import sqljsHttpVfs from "https://esm.sh/sql.js-httpvfs@0.8.12";
const { createDbWorker } = sqljsHttpVfs;

// ── Constants ─────────────────────────────────────────────────────────────────

const DB_URL        = "db/wiki.db";
const WORKER_URL    = "https://cdn.jsdelivr.net/npm/sql.js-httpvfs@0.8.12/dist/sqlite.worker.js";
const WASM_URL      = "https://cdn.jsdelivr.net/npm/sql.js-httpvfs@0.8.12/dist/sql-wasm.wasm";
const DEFAULT_PAGE  = "home";

// Navigation links shown in the header
const NAV_LINKS = [
    { label: "Realms",      slug: "realms"      },
    { label: "Seasons",     slug: "seasons"     },
    { label: "Nations",     slug: "nations"     },
    { label: "Characters",  slug: "characters"  },
    { label: "Players",     slug: "players"     },
    { label: "Mechanics",   slug: "mechanics"   },
];


// ── Database ──────────────────────────────────────────────────────────────────

let db = null;

async function openDatabase() {
    const worker = await createDbWorker(
        [{ from: "jsonconfig", configUrl: DB_URL }],
        WORKER_URL,
        WASM_URL
    );
    return worker;
}

async function queryPage(slug) {
    const results = await db.db.query(
        "SELECT slug, type, title, content, summary FROM pages WHERE slug = ?",
        [slug]
    );
    return results[0] ?? null;
}

async function pageExists(slug) {
    const results = await db.db.query(
        "SELECT 1 FROM pages WHERE slug = ?",
        [slug]
    );
    return results.length > 0;
}


// ── Routing ───────────────────────────────────────────────────────────────────

function getCurrentSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get("page") ?? DEFAULT_PAGE;
}

function navigateTo(slug) {
    const url = slug === DEFAULT_PAGE ? "/" : `/?page=${slug}`;
    history.pushState({ slug }, "", url);
    renderPage(slug);
}

window.addEventListener("popstate", (e) => {
    renderPage(e.state?.slug ?? DEFAULT_PAGE);
});


// ── Header ────────────────────────────────────────────────────────────────────

const mq = window.matchMedia("(max-width: 768px)");

function buildNavLinks() {
    return NAV_LINKS.map(({ label, slug }) =>
        `<a class="navigation-option center" data-slug="${slug}">${label}</a>`
    ).join("\n");
}

function renderHeader(showcase = "") {
    const header = document.getElementById("header");
    const nav    = buildNavLinks();

    if (mq.matches) {
        header.innerHTML = `
            <div id="header-top" class="center">
                <a id="header-logo" data-slug="${DEFAULT_PAGE}">
                    <img src="images/header-logo.webp" alt="Home">
                </a>
                <div id="header-text">Shattered Wiki</div>
                <div id="showcase">${showcase}</div>
            </div>
            <div id="header-navigation">${nav}</div>
        `;
    } else {
        header.innerHTML = `
            <div id="header-text" class="center">Shattered Wiki</div>
            <a id="header-logo" class="center" data-slug="${DEFAULT_PAGE}">
                <img src="images/header-logo.webp" alt="Home">
            </a>
            <div class="center" id="header-navigation">${nav}</div>
            <div id="showcase">${showcase}</div>
        `;
    }

    // Attach click handlers to all nav links and the logo
    header.querySelectorAll("[data-slug]").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            navigateTo(el.dataset.slug);
        });
    });
}

mq.addEventListener("change", () => {
    const showcase = document.getElementById("showcase")?.innerHTML ?? "";
    renderHeader(showcase);
});


// ── Markdown parser ───────────────────────────────────────────────────────────

/**
 * parseYaml(text)
 * Minimal YAML parser for flat key: value pairs and simple lists.
 * Handles the front matter we defined for character/nation pages.
 */
function parseYaml(text) {
    const result = {};
    const lines  = text.split("\n");
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const keyMatch = line.match(/^(\w[\w_-]*):\s*(.*)/);

        if (!keyMatch) { i++; continue; }

        const key   = keyMatch[1];
        const value = keyMatch[2].trim();

        // Indented list following an empty value
        if (value === "" && lines[i + 1]?.match(/^\s+-\s/)) {
            const items = [];
            i++;
            while (i < lines.length && lines[i].match(/^\s+-\s/)) {
                items.push(lines[i].replace(/^\s+-\s/, "").trim());
                i++;
            }
            result[key] = items;
            continue;
        }

        // Quoted string
        result[key] = value.replace(/^["']|["']$/g, "");
        i++;
    }

    return result;
}

/**
 * parseFrontMatter(content)
 * Splits a Markdown string into { meta, body }.
 * meta is parsed YAML; body is the remaining Markdown.
 */
function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    return {
        meta: parseYaml(match[1]),
        body: match[2],
    };
}

/**
 * resolveWikiLinks(text)
 * Converts [[slug]] and [[slug|display text]] into <a> tags.
 * Links are marked data-wiki-slug for later validation.
 */
function resolveWikiLinks(text) {
    return text
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, slug, label) =>
            `<a class="link-missing" data-wiki-slug="${slug.trim()}">${label.trim()}</a>`
        )
        .replace(/\[\[([^\]]+)\]\]/g, (_, slug) =>
            `<a class="link-missing" data-wiki-slug="${slug.trim()}">${slug.trim()}</a>`
        );
}

/**
 * parseMarkdown(text)
 * Converts Markdown body text to HTML.
 * Handles: headings, bold, separators, fences, images, paragraphs.
 */
function parseMarkdown(text) {
    const lines  = text.split("\n");
    const output = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Custom fence blocks ::: type
        if (trimmed.startsWith(":::")) {
            const fenceType = trimmed.slice(3).trim();   // e.g. "columns-3" or "flex"
            const content   = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith(":::")) {
                content.push(lines[i]);
                i++;
            }
            output.push(renderFence(fenceType, content.join("\n")));
            i++;
            continue;
        }

        // Separators
        if (trimmed === "===") { output.push('<hr class="thick">'); i++; continue; }
        if (trimmed === "---") { output.push("<hr>");               i++; continue; }
        if (trimmed === "- - -") { output.push('<hr class="dashed">'); i++; continue; }

        // Headings
        if (trimmed.startsWith("# "))  { output.push(`<h1>${inline(trimmed.slice(2))}</h1>`);  i++; continue; }
        if (trimmed.startsWith("## ")) { output.push(`<h2>${inline(trimmed.slice(3))}</h2>`);  i++; continue; }
        if (trimmed.startsWith("### ")){ output.push(`<h3>${inline(trimmed.slice(4))}</h3>`);  i++; continue; }
        if (trimmed.startsWith("#### ")){ output.push(`<h4>${inline(trimmed.slice(5))}</h4>`); i++; continue; }
        if (trimmed.startsWith("##### ")){ output.push(`<h5>${inline(trimmed.slice(6))}</h5>`); i++; continue; }

        // Blank line
        if (trimmed === "") { i++; continue; }

        // Paragraph: collect consecutive non-blank, non-special lines
        const paraLines = [];
        while (
            i < lines.length &&
            lines[i].trim() !== "" &&
            !lines[i].trim().startsWith("#") &&
            !lines[i].trim().startsWith(":::") &&
            !["---", "===", "- - -"].includes(lines[i].trim())
        ) {
            paraLines.push(lines[i].trim());
            i++;
        }
        if (paraLines.length) {
            output.push(`<p>${inline(paraLines.join(" "))}</p>`);
        }
    }

    return output.join("\n");
}

/**
 * inline(text)
 * Handles inline Markdown: bold, images, wiki links, external links.
 */
function inline(text) {
    return text
        // Images before links (images can appear inside links)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        // External links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Wiki links
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, slug, label) =>
            `<a class="link-missing" data-wiki-slug="${slug.trim()}">${label.trim()}</a>`
        )
        .replace(/\[\[([^\]]+)\]\]/g, (_, slug) =>
            `<a class="link-missing" data-wiki-slug="${slug.trim()}">${slug.trim()}</a>`
        )
        // Bold
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

/**
 * renderFence(type, content)
 * Expands ::: fence blocks into the appropriate div structure.
 * Handles specialized card syntax for flex layouts.
 */
function renderFence(type, content) {
    if (type === "flex") {
        const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
        
        const itemsHtml = lines.map(line => {
            // Target syntax: [[slug]] ![alt](image_url) Label Text
            const match = line.match(/^\[\[([^\]]+)\]\]\s*!\[([^\]]*)\]\(([^)]+)\)\s*(.*)$/);
            
            if (match) {
                const [_, slug, alt, imgUrl, label] = match;
                return `
                    <a class="flex-item link-missing" data-wiki-slug="${slug.trim()}">
                        <img src="${imgUrl}" alt="${alt}">
                        <span>${inline(label.trim())}</span>
                    </a>`.trim();
            }
            
            // Fallback for plain text or standard markdown lines inside a flex block
            return `<div class="flex-item">${inline(line)}</div>`;
        }).join("\n");

        return `<div class="flex">${itemsHtml}</div>`;
    }

    // Standard markdown rendering for column grids or unknown fences
    const inner = parseMarkdown(content.trim());

    if (type.startsWith("columns-")) {
        const n = type.split("-")[1];   // "2", "3", or "4"
        return `<div class="column-${n === "2" ? "two" : n === "3" ? "three" : "four"}">${inner}</div>`;
    }

    // Unknown fence: render as a plain div with the type as a class
    return `<div class="${type}">${inner}</div>`;
}


// ── Infobox renderers ─────────────────────────────────────────────────────────

/**
 * renderInfobox(type, meta)
 * Builds the structured infobox HTML from YAML front matter,
 * based on the page type.
 */
function renderInfobox(type, meta) {
    if (type === "characters") return renderCharacterInfobox(meta);
    if (type === "nations")    return renderNationInfobox(meta);
    return "";
}

function infoField(label, value) {
    if (!value) return "";
    return `<b class="green">${label}:</b> ${inline(String(value))}<br>`;
}

function renderCharacterInfobox(m) {
    const titles = Array.isArray(m.titles)
        ? m.titles.map(t => inline(t)).join("<br>")
        : inline(m.titles ?? "");

    return `
    <div class="column-three">
        <div>
            <h3>Who?</h3>
            <p>
                ${infoField("Full Name", m.full_name)}
                ${infoField("Common", m.common)}
                ${infoField("Nickname", m.nickname)}
                <br>
                ${infoField("Pronouns", m.pronouns)}
                ${infoField("Species", m.species)}
                ${infoField("Played by", m.played_by)}
            </p>
        </div>
        <div>
            <h3>When?</h3>
            <p>
                <b class="green">Birth:</b><br>${inline(m.birth ?? "")}<br><br>
                <b class="green">Death:</b><br>${inline(m.death ?? "")}<br>
            </p>
        </div>
        <div>
            <h3>Where?</h3>
            <p>
                ${infoField("Nation", m.nation)}
                <b class="green">Current Residence:</b><br>${inline(m.residence ?? "")}<br><br>
                <b class="green">Former Residences:</b><br>${inline(m.former_residences ?? "")}
            </p>
        </div>
        <div>
            <h3>What?</h3>
            <p>
                <b class="green">Titles:</b><br>${titles}<br><br>
                ${infoField("Occupations", m.occupations)}
                ${infoField("Former Occupations", m.former_occupations)}
            </p>
        </div>
        <div>
            <h3>How?</h3>
            <p>
                ${infoField("Height", m.height)}
                ${infoField("Weight", m.weight)}
                <br>
                ${infoField("Hair", m.hair)}
                ${infoField("Eyes", m.eyes)}
                <br>
                ${infoField("Notable Features", m.notable_features)}
            </p>
        </div>
        <div>
            <h3>Extra</h3>
            <p>${inline(m.extra ?? "")}</p>
        </div>
    </div>`;
}

function renderNationInfobox(m) {
    // To be expanded when we have nation pages to work from
    return `
    <div class="column-two">
        <div>
            ${infoField("Type", m.nation_type)}
            ${infoField("Realm", m.realm)}
            ${infoField("Season", m.season)}
            ${infoField("Capital", m.capital)}
            ${infoField("Leader", m.leader)}
        </div>
        <div>
            ${infoField("Founded", m.founded)}
            ${infoField("Dissolved", m.dissolved)}
            ${infoField("Religion", m.religion)}
            ${infoField("Allies", m.allies)}
        </div>
    </div>`;
}


// ── Link validation ───────────────────────────────────────────────────────────

/**
 * validateLinks(container)
 * Finds all [data-wiki-slug] links in the rendered page,
 * checks each slug against the database, and applies
 * link-exists or link-missing accordingly.
 */
async function validateLinks(container) {
    const links = container.querySelectorAll("[data-wiki-slug]");
    const slugs = [...new Set([...links].map(l => l.dataset.wikiSlug))];

    // Check all unique slugs in parallel
    const results = await Promise.all(
        slugs.map(async slug => [slug, await pageExists(slug)])
    );
    const existsMap = Object.fromEntries(results);

    links.forEach(link => {
        const exists = existsMap[link.dataset.wikiSlug];
        link.classList.toggle("link-exists",  exists);
        link.classList.toggle("link-missing", !exists);

        // Wire up navigation for existing links
        if (exists) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo(link.dataset.wikiSlug);
            });
        }

        // Image treatment
        const img = link.querySelector("img");
        if (img) {
            img.classList.toggle("img-missing", !exists);
        }
    });
}


// ── Page renderer ─────────────────────────────────────────────────────────────

async function renderPage(slug) {
    const bodyEl = document.getElementById("body");
    bodyEl.innerHTML = "<p>Loading…</p>";

    const page = await queryPage(slug);

    if (!page) {
        bodyEl.innerHTML = `<h1>Page not found</h1><p>No page with slug <b>${slug}</b> exists yet.</p>`;
        document.title = "Not found — Shattered Wiki";
        return;
    }

    const { meta, body } = parseFrontMatter(page.content);

    // Update page title
    document.title = `${page.title} — Shattered Wiki`;

    // Update showcase image in header if the page defines one
    const showcase = document.getElementById("showcase");
    if (showcase) {
        showcase.innerHTML = meta.showcase
            ? `<img src="${meta.showcase}" alt="${page.title}">`
            : "";
    }

    // Build HTML
    const infobox = renderInfobox(page.type, meta);
    const content = parseMarkdown(body);

    bodyEl.innerHTML = `
        <hr class="thick">
        <hr>
        ${content.includes("<h1>") ? "" : `<h1>${page.title}</h1>`}
        ${infobox ? `<h2>Basic Information</h2><hr>${infobox}` : ""}
        ${content}
    `;

    // Validate all wiki links against the database
    await validateLinks(bodyEl);
}


// ── Boot ──────────────────────────────────────────────────────────────────────

async function init() {
    renderHeader();

    try {
        db = await openDatabase();
    } catch (err) {
        document.getElementById("body").innerHTML =
            `<h1>Database error</h1><p>${err.message}</p>`;
        return;
    }

    await renderPage(getCurrentSlug());
}

init();
