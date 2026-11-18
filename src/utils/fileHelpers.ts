export function isValidHtmlFilename(filename: string): boolean {
  const lower = filename.trim().toLowerCase();
  return lower.endsWith('.html') || lower.endsWith('.htm');
}

export function getExportFilename(code: string): string {
  const titleMatch = code.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    const slug = titleMatch[1]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (slug.length > 0 && slug.length <= 48) {
      return `${slug}.html`;
    }
  }
  return 'index.html';
}

export function ensureValidHtmlDocument(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) {
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Document</title>\n</head>\n<body>\n</body>\n</html>\n';
  }
  return code.endsWith('\n') ? code : `${code}\n`;
}

export function clampSplitRatio(ratio: number, min = 20, max = 80): number {
  if (!Number.isFinite(ratio)) return 50;
  return Math.min(max, Math.max(min, Math.round(ratio * 10) / 10));
}
