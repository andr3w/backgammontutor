import { statSync, readdirSync } from 'node:fs';
import { $m, html } from './kit.mjs';
import { boardSvg } from '../static/board-svg.mjs';
import * as R from '../static/rules.mjs';

// /static is served with `Cache-Control: immutable` for a year, so the version
// goes in the *path*: /static/v<mtime>/play.mjs.
//
// It has to be the directory rather than a ?v= on each file, because a module
// imports its neighbours by relative specifier -- `./board-svg.mjs` -- and
// there is nowhere to put a query string on those. Stamping only the entry
// point pins a fresh play.mjs against a year-old board-svg.mjs, which fails at
// import time with "export not provided". Versioning the directory carries the
// whole module graph along with it.
const STATIC = new URL('../static/', import.meta.url);
const VER = Math.floor(Math.max(...readdirSync(STATIC)
  .map(f => statSync(new URL(f, STATIC)).mtimeMs)));
const asset = f => `/static/v${VER}/${f}`;

// Board -> monospace diagram. Not used in the page any more (see board-svg.mjs),
// kept because it is the quickest way to eyeball a parsed position at a terminal.
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

const script = f => `<script${f.endsWith('.mjs') ? ' type="module"' : ''} src="${asset(f)}"></script>`;

const shell = (title, body, scripts = []) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title><link rel="stylesheet" href="${asset('site.css')}">
<script>
// There are no devtools on a phone, and this is a phone-first site. Anything
// that goes wrong -- a script that fails to load, an uncaught error -- says so
// on the screen instead of failing silently. Inline and first, so it is
// running before anything it might have to report on, and so it does not
// depend on a stylesheet or a script of its own.
addEventListener('error', function (e) {
  var m = e.message || (e.target && e.target.src ? 'could not load ' + e.target.src : 'error');
  var b = document.getElementById('boom');
  if (!b) {
    b = document.createElement('pre');
    b.id = 'boom';
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99;margin:0;padding:.6em;'
      + 'font:11px/1.4 ui-monospace,monospace;white-space:pre-wrap;color:#fff;background:#a11;';
    (document.body || document.documentElement).appendChild(b);
  }
  b.textContent += m + '\\n';
}, true);
addEventListener('unhandledrejection', function (e) {
  dispatchEvent(new ErrorEvent('error', { message: 'unhandled: ' + (e.reason && e.reason.message || e.reason) }));
});
</script>
</head><body>
${body}
${scripts.map(script).join('\n')}
</body></html>`;

const el = (tag, attrs, kids) => ({ tag, attrs, kids });

// A page is a vertical pager of full-height screens. Runs of prose become one
// text screen; each question becomes a screen with a pinned board above a
// discussion that scrolls on its own.
// Everything the browser needs to play the question, carried on the section.
// An attribute rather than a <script type=application/json> block: attribute
// values are escaped and unescaped correctly by the HTML parser, whereas
// escaped text inside a script element would arrive at JSON.parse still
// escaped.
const asHtml = v => (typeof v === 'string' ? html($m('p', v)) : html(v));

function payload(m, side) {
  return JSON.stringify({
    id: m.id, side, dice: m.dice, pos: m.board,
    goals: (m.goals || []).map(g => ({
      kind: g.kind, arg: g.arg,
      why: g.why ? asHtml(g.why) : null,
      otherwise: g.otherwise ? asHtml(g.otherwise) : null,
    })),
    traps: Object.fromEntries(Object.entries(m.traps || {}).map(([k, v]) => [k, asHtml(v)])),
    otherwise: m.otherwise ? asHtml(m.otherwise) : null,
  });
}

function questionScreen(m, lead, n) {
  const side = m.turn || 'x';
  const dice = R.roll(m.dice).map(v => ({ v }));
  // The opening highlight is computed here so the page is already correct
  // before play.mjs runs -- and so a crawler sees a real board, not a stub.
  const opening = R.plays(m.board, side, R.roll(m.dice)).map(s => s[0]);
  const withFirst = new Set(opening.filter(s => s.die === dice[0].v).map(s => s.from));
  const highlight = [...new Set(opening.map(s => s.from))]
    .map(p => ({ p, weak: !withFirst.has(p) }));

  return el('section', { class: 'screen screen-question', id: m.id, 'data-q': payload(m, side) }, [
    el('div', { class: 'board-area' }, [
      boardSvg($m, m.board, { dice, cur: 0, turn: side, highlight, interactive: true }),
      el('div', { class: 'qnum', 'aria-label': `Question ${n}` }, [String(n)]),
      el('div', { class: 'medal', hidden: '', title: 'Solved', 'aria-label': 'Solved' }, ['\u2605']),
      el('div', { class: 'controls' }, [
        el('button', { type: 'button', class: 'undo', hidden: '' }, ['Undo']),
      ]),
    ]),
    el('div', { class: 'discussion' }, [
      el('div', { class: 'discussion-inner' }, [
        ...(lead ? [el('div', { class: 'lead' }, lead)] : []),
        m.ask,
        el('p', { class: 'hint' }, ['Tap a point to play. Tap the dice to use the other one.']),
        el('div', { class: 'answer' }, []),
      ]),
    ]),
  ]);
}

// The ending. What the student has and has not solved is only known in the
// browser, so the counts and the list of unfinished questions are left empty
// here and filled in by play.mjs.
function endScreen(tail, p, titles) {
  // Recommendations name the page they lead to, so a renamed page cannot leave
  // a link claiming something it no longer is.
  const onward = p.next.length
    ? p.next.map(slug => el('a', { class: 'onward', href: '/' + slug }, [titles[slug] || slug]))
    : [el('a', { class: 'onward', href: '/' }, ['All pages'])];
  // The medals are written out here, all of them, so the summary is a real
  // list for a crawler and a reader with no JavaScript. play.mjs only decides
  // which ones are won.
  const medals = p.questions.map((q, i) => el('li', { class: 'medal-slot', 'data-for': q.id }, [
    el('a', { href: '#' + q.id }, [
      // The number, not a star: it is what the question is called, and gold
      // already says the medal has been won.
      el('span', { class: 'pip' }, [String(i + 1)]),
      el('span', { class: 'roll' }, [q.dice.join('-')]),
    ]),
  ]));
  return el('section', { class: 'screen screen-text screen-end' }, [
    el('div', { class: 'text-inner' }, [
      el('p', { class: 'score' }, []),
      el('ul', { class: 'medals' }, medals),
      ...tail,
      el('div', { class: 'onward-wrap' }, onward),
    ]),
  ]);
}

/**
 * A page is a vertical pager of full-height screens.
 *
 * The board is the first thing on the screen: the title and any prose written
 * before the first question ride in that question's discussion rather than
 * taking a screen of their own. Students do, they do not read -- but the title
 * is still there under the board for anyone who looks, permanently, and it is
 * still the document's first heading. Prose between questions keeps a screen
 * to itself; prose after the last question joins the ending.
 */
function screens(tree, p, titles) {
  const out = [];
  let run = [];
  let first = true;
  let n = 0;
  for (const kid of tree.kids) {
    if (typeof kid !== 'string' && kid.meta) {
      n++;
      if (first) { out.push(questionScreen(kid.meta, run.length ? run : null, n)); first = false; }
      else {
        if (run.length) out.push(el('section', { class: 'screen screen-text' },
          [el('div', { class: 'text-inner' }, run)]));
        out.push(questionScreen(kid.meta, null, n));
      }
      run = [];
    } else {
      run.push(kid);
    }
  }
  out.push(endScreen(run, p, titles));
  return out;
}

export function renderPage(p, titles = {}) {
  const body = el('main', { class: 'pager' }, screens(p.tree, p, titles));
  return shell(p.title, html(body), ['m.js', 'nav.js', 'play.mjs']);
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
