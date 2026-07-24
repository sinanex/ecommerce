/**
 * Feed helper utilities for XML escaping, slugification, and URL formatting.
 */

/**
 * Escapes characters that are unsafe for XML.
 * Also removes invalid XML control characters that can cause parsing errors.
 */
export function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  
  // Strip invalid XML control characters (ASCII 0-8, 11-12, 14-31)
  const cleanStr = unsafe.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return cleanStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Converts a string into a URL-friendly slug.
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return 'product';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

/**
 * Ensures an asset or link URL is absolute using the configured base URL.
 * Handles relative paths and absolute paths correctly.
 */
export function toAbsoluteUrl(path: string | null | undefined, baseUrl: string): string {
  if (!path) return baseUrl;

  // If already absolute, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return `${cleanBaseUrl}/${cleanPath}`;
}
