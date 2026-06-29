// Builds a URL-safe slug from a community name: lowercase, spaces to hyphens,
// strip anything that isn't a letter/number/hyphen, collapse repeats.
export const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
