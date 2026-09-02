#!/usr/bin/env node
// node build.mjs <slug>     -> built/<slug>.html
// node build.mjs --index    -> built/index.html
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { renderPage, renderIndex } from './lib/render.mjs';

const here = new URL('.', import.meta.url);
const arg = process.argv[2];
mkdirSync(new URL('built/', here), { recursive: true });

const slugs = () => readdirSync(new URL('pages/', here))
  .filter(f => f.endsWith('.mjs')).map(f => f.replace(/\.mjs$/, '')).sort();

const load = s => import(new URL(`pages/${s}.mjs`, here)).then(m => m.default);

if (arg === '--index') {
  const pages = await Promise.all(slugs().map(async s => ({ slug: s, title: (await load(s)).title })));
  writeFileSync(new URL('built/index.html', here), renderIndex(pages));
  console.error('built/index.html');
} else if (arg) {
  if (!slugs().includes(arg)) { console.error(`no such page: ${arg}`); process.exit(2); }
  writeFileSync(new URL(`built/${arg}.html`, here), renderPage(await load(arg)));
  console.error(`built/${arg}.html`);
} else {
  console.error('usage: build.mjs <slug> | --index');
  process.exit(2);
}
