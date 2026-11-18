const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'pre', 'textarea']);

const INLINE_SHORT_ELEMENTS = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'button',
  'cite',
  'code',
  'data',
  'del',
  'dfn',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'i',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'mark',
  'option',
  'p',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'td',
  'th',
  'time',
  'title',
  'u',
  'var',
]);

interface Token {
  type: 'doctype' | 'comment' | 'raw' | 'open' | 'close' | 'self-close' | 'text';
  value: string;
  tagName?: string;
}

function tokenizeHtml(html: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = html.length;

  while (i < len) {
    if (html[i] === '<') {
      // Comment
      if (html.startsWith('<!--', i)) {
        const end = html.indexOf('-->', i + 4);
        const endIdx = end === -1 ? len : end + 3;
        tokens.push({ type: 'comment', value: html.slice(i, endIdx) });
        i = endIdx;
        continue;
      }

      // DOCTYPE
      if (/^<!doctype\b/i.test(html.slice(i, i + 12))) {
        const end = html.indexOf('>', i);
        const endIdx = end === -1 ? len : end + 1;
        tokens.push({ type: 'doctype', value: html.slice(i, endIdx) });
        i = endIdx;
        continue;
      }

      // Closing tag
      const closeMatch = html.slice(i).match(/^<\/([a-zA-Z0-9:-]+)\s*>/);
      if (closeMatch) {
        tokens.push({
          type: 'close',
          tagName: closeMatch[1].toLowerCase(),
          value: `</${closeMatch[1].toLowerCase()}>`,
        });
        i += closeMatch[0].length;
        continue;
      }

      // Opening or self-closing tag (respecting quotes)
      const openNameMatch = html.slice(i).match(/^<([a-zA-Z0-9:-]+)/);
      if (openNameMatch) {
        const tagName = openNameMatch[1].toLowerCase();
        let j = i + openNameMatch[0].length;
        let quote: string | null = null;
        while (j < len) {
          const ch = html[j];
          if (quote) {
            if (ch === quote) quote = null;
          } else {
            if (ch === '"' || ch === "'") quote = ch;
            else if (ch === '>') {
              j++;
              break;
            }
          }
          j++;
        }

        const rawTag = html.slice(i, j);
        const isSelfClosing =
          rawTag.endsWith('/>') || VOID_ELEMENTS.has(tagName);

        if (RAW_TEXT_ELEMENTS.has(tagName) && !isSelfClosing) {
          const closeRegex = new RegExp(`</${tagName}\\s*>`, 'i');
          const rest = html.slice(j);
          const closeFound = rest.match(closeRegex);
          if (closeFound && closeFound.index !== undefined) {
            const inner = rest.slice(0, closeFound.index);
            const closingTag = `</${tagName}>`;
            tokens.push({
              type: 'raw',
              tagName,
              value: `${rawTag}${inner}${closingTag}`,
            });
            i = j + closeFound.index + closeFound[0].length;
            continue;
          }
        }

        tokens.push({
          type: isSelfClosing ? 'self-close' : 'open',
          tagName,
          value: rawTag,
        });
        i = j;
        continue;
      }
    }

    // Text node
    const nextTag = html.indexOf('<', i + 1);
    const endIdx = nextTag === -1 ? len : nextTag;
    const text = html.slice(i, endIdx);
    if (text.trim().length > 0) {
      tokens.push({
        type: 'text',
        value: text.replace(/\s+/g, ' ').trim(),
      });
    }
    i = endIdx;
  }

  return tokens;
}

function formatRawBlock(rawBlock: string, indent: string, indentUnit: string): string[] {
  const openEnd = rawBlock.indexOf('>');
  const closeStart = rawBlock.lastIndexOf('</');
  if (openEnd === -1 || closeStart === -1 || closeStart <= openEnd) {
    return [`${indent}${rawBlock.trim()}`];
  }

  const openTag = rawBlock.slice(0, openEnd + 1).trim();
  const inner = rawBlock.slice(openEnd + 1, closeStart);
  const closeTag = rawBlock.slice(closeStart).trim();

  if (openTag.toLowerCase().startsWith('<pre') || openTag.toLowerCase().startsWith('<textarea')) {
    return [`${indent}${openTag}${inner}${closeTag}`];
  }

  const trimmedInner = inner.trim();
  if (!trimmedInner) {
    return [`${indent}${openTag}${closeTag}`];
  }

  const innerLines = trimmedInner.split('\n');
  // Strip common leading indentation from multi-line style/script blocks
  const nonEmptyLines = innerLines.filter((l) => l.trim().length > 0);
  const minIndent = nonEmptyLines.reduce((min, line) => {
    const match = line.match(/^(\s*)/);
    const spaces = match ? match[1].length : 0;
    return Math.min(min, spaces);
  }, Infinity);

  const normalizedLines = innerLines.map((line) => {
    if (!line.trim()) return '';
    return `${indent}${indentUnit}${line.slice(minIndent === Infinity ? 0 : minIndent).trimEnd()}`;
  });

  if (nonEmptyLines.length === 1 && trimmedInner.length <= 60) {
    return [`${indent}${openTag} ${trimmedInner} ${closeTag}`];
  }

  return [`${indent}${openTag}`, ...normalizedLines, `${indent}${closeTag}`];
}

export function formatHtml(input: string, indentSize = 2): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const indentUnit = ' '.repeat(indentSize);
  const tokens = tokenizeHtml(trimmed);
  const lines: string[] = [];
  let depth = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const indent = indentUnit.repeat(depth);

    if (token.type === 'doctype') {
      lines.push(`${indent}<!DOCTYPE html>`);
      continue;
    }

    if (token.type === 'comment') {
      const commentLines = token.value.split('\n').map((l) => l.trim());
      if (commentLines.length === 1) {
        lines.push(`${indent}${commentLines[0]}`);
      } else {
        for (const cl of commentLines) {
          lines.push(`${indent}${cl}`);
        }
      }
      continue;
    }

    if (token.type === 'raw') {
      lines.push(...formatRawBlock(token.value, indent, indentUnit));
      continue;
    }

    if (token.type === 'self-close') {
      lines.push(`${indent}${token.value.trim()}`);
      continue;
    }

    if (token.type === 'open') {
      const next = tokens[i + 1];
      const nextNext = tokens[i + 2];

      // Compact empty tag: <div></div>
      if (next && next.type === 'close' && next.tagName === token.tagName) {
        lines.push(`${indent}${token.value.trim()}${next.value}`);
        i += 1;
        continue;
      }

      // Compact short inline element: <h1>Hello</h1>
      if (
        next &&
        next.type === 'text' &&
        nextNext &&
        nextNext.type === 'close' &&
        nextNext.tagName === token.tagName &&
        (INLINE_SHORT_ELEMENTS.has(token.tagName || '') || next.value.length <= 60)
      ) {
        lines.push(`${indent}${token.value.trim()}${next.value}${nextNext.value}`);
        i += 2;
        continue;
      }

      lines.push(`${indent}${token.value.trim()}`);
      depth++;
      continue;
    }

    if (token.type === 'close') {
      depth = Math.max(0, depth - 1);
      lines.push(`${indentUnit.repeat(depth)}${token.value}`);
      continue;
    }

    if (token.type === 'text') {
      lines.push(`${indent}${token.value}`);
    }
  }

  return lines.join('\n');
}

export function countEditorStats(code: string): { lines: number; chars: number } {
  if (!code) return { lines: 1, chars: 0 };
  return {
    lines: code.split('\n').length,
    chars: code.length,
  };
}
