-- ============================================================
-- Wiki database schema
-- Run via seed.py, not directly.
-- ============================================================


-- Pages: one row per wiki article.
CREATE TABLE IF NOT EXISTS pages (
    id          INTEGER PRIMARY KEY,
    slug        TEXT    NOT NULL UNIQUE,   -- URL identifier, e.g. "third-battle-of-ypres"
    type        TEXT    NOT NULL,          -- page type: "character", "nation", "navigation", "player", "general"
    title       TEXT    NOT NULL,
    content     TEXT    NOT NULL,          -- Markdown, with YAML front matter for structured data
    summary     TEXT,                      -- short blurb for search previews
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);


-- Tags: thematic categories.
CREATE TABLE IF NOT EXISTS tags (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE,
    color TEXT                     -- optional hex color, e.g. "#8b5e3c"
);

-- Page–tag join table.
CREATE TABLE IF NOT EXISTS page_tags (
    page_id  INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    tag_id   INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (page_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_page_tags_page ON page_tags(page_id);
CREATE INDEX IF NOT EXISTS idx_page_tags_tag  ON page_tags(tag_id);


-- Links: explicit cross-references between pages.
-- Enables backlink queries: "what other pages link to this one?"
CREATE TABLE IF NOT EXISTS links (
    from_page_id  INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    to_page_id    INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    anchor_text   TEXT,
    PRIMARY KEY (from_page_id, to_page_id)
);

CREATE INDEX IF NOT EXISTS idx_links_from ON links(from_page_id);
CREATE INDEX IF NOT EXISTS idx_links_to   ON links(to_page_id);


-- Media: images and other assets.
CREATE TABLE IF NOT EXISTS media (
    id        INTEGER PRIMARY KEY,
    filename  TEXT NOT NULL,
    caption   TEXT,
    alt_text  TEXT
);

-- Page–media join table.
CREATE TABLE IF NOT EXISTS page_media (
    page_id    INTEGER NOT NULL REFERENCES pages(id)  ON DELETE CASCADE,
    media_id   INTEGER NOT NULL REFERENCES media(id)  ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (page_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_page_media_page ON page_media(page_id);
