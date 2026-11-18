import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidHtmlFilename,
  getExportFilename,
  ensureValidHtmlDocument,
  clampSplitRatio,
} from './fileHelpers';

test('isValidHtmlFilename accepts .html and .htm case-insensitively', () => {
  assert.equal(isValidHtmlFilename('page.html'), true);
  assert.equal(isValidHtmlFilename('INDEX.HTM'), true);
  assert.equal(isValidHtmlFilename('script.js'), false);
  assert.equal(isValidHtmlFilename('styles.css'), false);
});

test('getExportFilename derives slug from title tag or falls back to index.html', () => {
  assert.equal(getExportFilename('<html><head><title>My Landing Page</title></head></html>'), 'my-landing-page.html');
  assert.equal(getExportFilename('<h1>No title</h1>'), 'index.html');
});

test('ensureValidHtmlDocument returns fallback skeleton when empty', () => {
  const emptyDoc = ensureValidHtmlDocument('   ');
  assert.match(emptyDoc, /<!DOCTYPE html>/);
  assert.equal(ensureValidHtmlDocument('<p>Hi</p>'), '<p>Hi</p>\n');
});

test('clampSplitRatio constrains width percentages safely', () => {
  assert.equal(clampSplitRatio(50), 50);
  assert.equal(clampSplitRatio(5), 20);
  assert.equal(clampSplitRatio(95), 80);
  assert.equal(clampSplitRatio(Number.NaN), 50);
});
