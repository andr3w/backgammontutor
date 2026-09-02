#!/usr/bin/env node
// node build.mjs <slug>     -> built/<slug>.html
// node build.mjs --index    -> built/index.html
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { renderPage, renderIndex, renderGlossary } from './lib/render.mjs';
import { checkPage, checkGlossary, report } from './lib/check.mjs';

const here = new URL('.', import.meta.url);
const arg = process.argv[2];
mkdirSync(new URL('built/', here), { recursive: true });

const slugs = () => readdirSync(new URL('pages/', here))
  .filter(f => f.endsWith('.mjs')).map(f => f.replace(/\.mjs$/, '')).sort();

const load = s => import(new URL(`pages/${s}.mjs`, here)).then(m => m.default);

if (arg === '--glossary') {
  writeFileSync(new URL('built/glossary.html', here), renderGlossary());
  console.error('built/glossary.html');
} else if (arg === '--index') {
  const pages = await Promise.all(slugs().map(async s => ({ slug: s, title: (await load(s)).title })));
  writeFileSync(new URL('built/index.html', here), renderIndex(pages));
  console.error('built/index.html');
} else if (arg) {
  if (!slugs().includes(arg)) { console.error(`no such page: ${arg}`); process.exit(2); }
  const page = await load(arg);
  // Authoring mistakes are silent at runtime -- a trap keyed to an illegal
  // play just never fires -- so the build refuses to ship them.
  if (report([...checkPage(page), ...checkGlossary(page)], arg)) process.exit(1);
  // A recommendation is rendered with the title of the page it points at, so
  // those pages have to be loaded too.
  const titles = Object.fromEntries(await Promise.all(
    page.next.filter(s => slugs().includes(s)).map(async s => [s, (await load(s)).title])));
  writeFileSync(new URL(`built/${arg}.html`, here), renderPage(page, titles));
  console.error(`built/${arg}.html`);
} else {
  console.error('usage: build.mjs <slug> | --index | --glossary');
  process.exit(2);
}
