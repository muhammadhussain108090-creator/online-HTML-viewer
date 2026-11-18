import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHtml, countEditorStats } from './htmlFormatter';

test('formatHtml returns empty string for whitespace-only input', () => {
  assert.equal(formatHtml('   \n\t  '), '');
});

test('formatHtml indents nested HTML elements cleanly', () => {
  const messy = '<!doctype html><html><head><title>Test</title></head><body><div class="box"><h1>Hello</h1><p>World</p></div></body></html>';
  const expected = [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>Test</title>',
    '  </head>',
    '  <body>',
    '    <div class="box">',
    '      <h1>Hello</h1>',
    '      <p>World</p>',
    '    </div>',
    '  </body>',
    '</html>',
  ].join('\n');
  assert.equal(formatHtml(messy), expected);
});

test('formatHtml handles void elements without increasing depth', () => {
  const html = '<div><meta charset="UTF-8"><img src="a.png" alt="A"><br><p>After</p></div>';
  const expected = [
    '<div>',
    '  <meta charset="UTF-8">',
    '  <img src="a.png" alt="A">',
    '  <br>',
    '  <p>After</p>',
    '</div>',
  ].join('\n');
  assert.equal(formatHtml(html), expected);
});

test('formatHtml preserves style and script blocks cleanly', () => {
  const html = '<head><style>body { color: red; }</style><script>const x = 1;</script></head>';
  const expected = [
    '<head>',
    '  <style> body { color: red; } </style>',
    '  <script> const x = 1; </script>',
    '</head>',
  ].join('\n');
  assert.equal(formatHtml(html), expected);
});

test('countEditorStats computes line and character counts', () => {
  assert.deepEqual(countEditorStats(''), { lines: 1, chars: 0 });
  assert.deepEqual(countEditorStats('<h1>Hi</h1>\n<p>Ok</p>'), { lines: 2, chars: 21 });
});
