"""
seed.py — builds wiki.db from a flat new/ folder.

Usage:
    python seed.py

Place all new .md entries directly into the 'new/' directory at the repository root.
Ensure each markdown file has a 'type: <category>' field in its front matter.
"""

import sqlite3
import os
import re
from datetime import datetime, timezone

# ── Paths ────────────────────────────────────────────────────────────────────

ROOT_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH     = os.path.join(ROOT_DIR, "db", "wiki.db")
SCHEMA_PATH = os.path.join(ROOT_DIR, "db", "schema.sql")
NEW_DIR     = os.path.join(ROOT_DIR, "new")  # Flattened target directory

# Valid page types for validation reference
VALID_TYPES = {"characters", "nations", "navigation", "players", "general"}


# ── Helpers ──────────────────────────────────────────────────────────────────

def read_file(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def extract_type(content):
    """Pull the type field from the YAML front matter block."""
    in_front_matter = False
    for line in content.splitlines():
        stripped = line.strip()
        if stripped == "---":
            if in_front_matter:
                break  # Exit when front matter ends
            in_front_matter = True
            continue
        if in_front_matter:
            # Extract key/value pairs matching 'type: category'
            match = re.match(r'^type:\s*["\']?([a-zA-Z0-9_-]+)["\']?', stripped)
            if match:
                return match.group(1).lower()
    return "general"  # Fallback type if none is defined


def extract_title(content):
    """Pull the text from the first # heading in Markdown."""
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    return "Untitled"


def extract_summary(content, max_length=200):
    """
    Pull the first plain paragraph of text as a summary.
    Skips YAML front matter, headings, and custom fence blocks.
    """
    in_front_matter = False
    in_fence = False

    for line in content.splitlines():
        stripped = line.strip()

        # Toggle YAML front matter
        if stripped == "---":
            in_front_matter = not in_front_matter
            continue
        if in_front_matter:
            continue

        # Skip custom fences (:::)
        if stripped.startswith(":::"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        # Skip headings, blank lines, images, separators
        if not stripped:
            continue
        if stripped.startswith("#"):
            continue
        if stripped.startswith("!"):
            continue
        if stripped in ("---", "===", "- - -"):
            continue

        # First real paragraph line
        if len(stripped) > max_length:
            return stripped[:max_length].rstrip() + "…"
        return stripped

    return None


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


# ── Database setup ───────────────────────────────────────────────────────────

def init_database(conn):
    """Create all tables and indexes from schema.sql."""
    schema = read_file(SCHEMA_PATH)
    conn.executescript(schema)
    conn.commit()
    print("Database schema ready.")


# ── Page loading ─────────────────────────────────────────────────────────────

def collect_pages():
    """
    Walk the flat new/ folder and return a list of page dicts.
    """
    pages = []

    if not os.path.isdir(NEW_DIR):
        print(f"Directory not found: {NEW_DIR}")
        return pages

    for filename in sorted(os.listdir(NEW_DIR)):
        if not filename.endswith(".md"):
            continue

        slug = os.path.splitext(filename)[0]
        path = os.path.join(NEW_DIR, filename)
        content = read_file(path)
        page_type = extract_type(content)

        pages.append({
            "slug":    slug,
            "type":    page_type,
            "content": content,
            "title":   extract_title(content),
            "summary": extract_summary(content),
        })

    return pages


def load_pages(conn):
    """Upsert all collected pages into the database."""
    pages = collect_pages()

    if not pages:
        print(f"No .md files found in {NEW_DIR}")
        return

    cursor   = conn.cursor()
    inserted = 0
    updated  = 0
    skipped  = 0

    for page in pages:
        cursor.execute("SELECT id, content FROM pages WHERE slug = ?", (page["slug"],))
        existing = cursor.fetchone()

        if existing is None:
            cursor.execute("""
                INSERT INTO pages (slug, type, title, content, summary, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (page["slug"], page["type"], page["title"], page["content"],
                  page["summary"], now(), now()))
            print(f"  + Inserted [{page['type']}]: {page['slug']}")
            inserted += 1

        elif existing[1] != page["content"]:
            cursor.execute("""
                UPDATE pages
                SET type = ?, title = ?, content = ?, summary = ?, updated_at = ?
                WHERE slug = ?
            """, (page["type"], page["title"], page["content"],
                  page["summary"], now(), page["slug"]))
            print(f"  ~ Updated  [{page['type']}]: {page['slug']}")
            updated += 1

        else:
            skipped += 1

    conn.commit()
    print(f"\nPages: {inserted} inserted, {updated} updated, {skipped} unchanged.")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print(f"Building {DB_PATH}\n")

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        init_database(conn)
        load_pages(conn)

    print("\nDone. Push wiki.db to GitHub when ready.")


if __name__ == "__main__":
    main()