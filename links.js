const linkStatusCache = new Map();

function resolveUrl(rawHref) {
  try {
    if (/^https?:\/\//i.test(rawHref)) {
      return new URL(rawHref);
    } else {
      return new URL("/" + rawHref.replace(/^\/+/, ""), window.location.origin);
    }
  } catch {
    return null;
  }
}

function applyExists(link) {
  link.classList.remove("link-missing");
  link.classList.add("link-exists");

  // If it contains an image, restore normal look
  const img = link.querySelector("img");
  if (img) {
    img.classList.remove("img-missing");
  }
}

function applyMissing(link) {
  link.classList.add("link-missing");

  // If it contains an image, apply "disabled" look
  const img = link.querySelector("img");
  if (img) {
    img.classList.add("img-missing");
  }
}

document.querySelectorAll("a[href]").forEach(link => {
  const rawHref = link.getAttribute("href")?.trim();

  // Default state
  applyMissing(link);

  if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
    return;
  }

  const url = resolveUrl(rawHref);
  if (!url) return;

  // Only same-origin
  if (url.origin !== window.location.origin) return;

  const key = url.href;

  // Cached?
  if (linkStatusCache.has(key)) {
    if (linkStatusCache.get(key)) {
      applyExists(link);
    }
    return;
  }

  fetch(key, { method: "HEAD" })
    .then(res => {
      const exists = res.ok;
      linkStatusCache.set(key, exists);

      if (exists) {
        applyExists(link);
      }
    })
    .catch(() => {
      linkStatusCache.set(key, false);
      // stays missing
    });
});