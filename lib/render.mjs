import { statSync } from 'node:fs';
import { html } from './kit.mjs';

// /static is served with `Cache-Control: immutable` for a year, so every asset
// URL carries its own mtime. Edit the CSS and the URL changes; don't and it
// stays cached.
const stamp = f => {
  try { return `${f}?v=${Math.floor(statSync(new URL('../static/' + f.split('/').pop(), import.meta.url)).mtimeMs)}`; }
  catch { return f; }
};

// Board -> monospace diagram, in the same notation the author typed.
export function toAscii(b) {
  const cell = p => { const c = b.pts[p]; return c ? (c.side === 'x' ? 'X' : 'O') : '·'; };
  const depth = half => Math.max(5, ...half.map(p => b.pts[p]?.n ?? 0));
  const top = [13,14,15,16,17,18,19,20,21,22,23,24];
  const bot = [12,11,10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const row = cs => ' ' + cs.slice(0,6).map(c=>c.padStart(2)+' ').join('') + '│' + cs.slice(6).map(c=>c.padStart(3)).join('');
  const nums = ps => row(ps.map(String));
  const half = (ps, dep, down) => {
    const out = [];
    for (let r = 0; r < dep; r++) {
      const lvl = down ? r : dep - 1 - r;
      out.push(row(ps.map(p => (b.pts[p]?.n ?? 0) > lvl ? cell(p) : (lvl === 0 ? '·' : ' '))));
    }
    return out;
  };
  const dt = depth(top), db = depth(bot);
  const extra = [];
  for (const [k, lbl] of [['bar','bar'], ['off','off']])
    for (const c of ['x','o']) if (b[k][c]) extra.push(`${lbl} ${c.toUpperCase()}×${b[k][c]}`);
  return [nums(top), ...half(top, dt, true),
          ' ' + '─'.repeat(18) + '┼' + '─'.repeat(18),
          ...half(bot, db, false), nums(bot),
          ...(extra.length ? ['', ' ' + extra.join('   ')] : [])].join('\n');
}

const shell = (title, body, script) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title><link rel="stylesheet" href="/static/${stamp('site.css')}">
</head><body>
${body}
${script ? `<script src="/static/${stamp(script)}"></script>` : ''}
</body></html>`;

const el = (tag, attrs, kids) => ({ tag, attrs, kids });

// A page is a vertical pager of full-height screens. Runs of prose become one
// text screen; each question becomes a screen with a pinned board above a
// discussion that scrolls on its own.
function screens(tree) {
  const out = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    out.push(el('section', { class: 'screen screen-text' },
      [el('div', { class: 'text-inner' }, run)]));
    run = [];
  };
  for (const kid of tree.kids) {
    if (typeof kid !== 'string' && kid.meta) {
      flush();
      const m = kid.meta;
      out.push(el('section', { class: 'screen screen-question', id: m.id }, [
        el('div', { class: 'board-area' }, [
          el('pre', { class: 'board' }, [toAscii(m.board)]),
          el('p', { class: 'dice' }, [`Rolled ${m.dice.join('-')}`]),
        ]),
        el('div', { class: 'discussion' }, [
          el('div', { class: 'discussion-inner' }, [
            m.ask,
            el('p', { class: 'placeholder' }, ['Tap a point to play your move. (not wired up yet)']),
          ]),
        ]),
      ]));
    } else if (typeof kid !== 'string' && kid.tag === 'h1') {
      run.push(kid);
    } else {
      run.push(kid);
    }
  }
  flush();
  return out;
}

export function renderPage(p) {
  const body = el('main', { class: 'pager' }, screens(p.tree));
  return shell(p.title, html(body), 'nav.js');
}

export function renderIndex(pages) {
  const body = el('main', { class: 'pager' }, [
    el('section', { class: 'screen screen-text' }, [
      el('div', { class: 'text-inner' }, [
        el('h1', {}, ['Backgammon Tutor']),
        el('ul', { class: 'toc' }, pages.map(({ slug, title }) =>
          el('li', {}, [el('a', { href: '/' + slug }, [title])]))),
      ]),
    ]),
  ]);
  return shell('Backgammon Tutor', html(body));
}
