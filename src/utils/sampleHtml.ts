export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Editorial Article Sample</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.65;
      color: #18181b;
      background-color: #ffffff;
      padding: 48px 24px;
    }
    main {
      max-width: 680px;
      margin: 0 auto;
    }
    header {
      padding-bottom: 24px;
      margin-bottom: 32px;
      border-bottom: 1px solid #e4e4e7;
    }
    .kicker {
      font-size: 13px;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 32px;
      line-height: 1.2;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .lead {
      font-size: 17px;
      color: #52525b;
    }
    section {
      margin-bottom: 28px;
    }
    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    p {
      color: #3f3f46;
      margin-bottom: 14px;
    }
    ul {
      padding-left: 20px;
      color: #3f3f46;
    }
    li {
      margin-bottom: 6px;
    }
    .callout {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 18px 20px;
      margin-top: 24px;
    }
    .callout strong {
      display: block;
      margin-bottom: 4px;
      color: #18181b;
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="kicker">Web Fundamentals</p>
      <h1>Writing Clean, Semantic HTML</h1>
      <p class="lead">Edit this HTML document on the left and watch the live webpage update immediately.</p>
    </header>
    <section>
      <h2>Why Semantic Structure Matters</h2>
      <p>Semantic elements like <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;section&gt;</code> communicate meaning to browsers, screen readers, and search engines without adding unnecessary markup.</p>
      <ul>
        <li>Clear document outline for assistive technologies</li>
        <li>Predictable styling hooks with minimal CSS</li>
        <li>Portable documents that render cleanly everywhere</li>
      </ul>
    </section>
    <div class="callout">
      <strong>Try it yourself</strong>
      <p style="margin-bottom: 0;">Modify any heading, add a table, or import your own <code>.html</code> file using the toolbar on the left.</p>
    </div>
  </main>
</body>
</html>`;
