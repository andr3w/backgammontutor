import { html } from './kit.mjs';

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

const shell = (title, body) => `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><link rel="stylesheet" href="/static/site.css">
</head><body>
${body}
</body></html>`;

export function renderPage(p) {
  const q = p.questions[Symbol.iterator] ? [...p.questions] : [];
  let i = 0;
  const walk = n => {
    if (typeof n === 'string') return n;
    if (n.meta) {
      const m = n.meta;
      return { tag: 'section', attrs: { class: 'question', id: m.id }, kids: [
        { tag: 'pre', attrs: { class: 'board' }, kids: [toAscii(m.board)] },
        { tag: 'p', attrs: { class: 'dice' }, kids: [`Rolled ${m.dice.join('-')}`] },
        m.ask,
        { tag: 'div', attrs: { class: 'answer' }, kids: ['(answer interface not built yet)'] },
      ] };
    }
    return { ...n, kids: n.kids.map(walk) };
  };
  return shell(p.title, html(walk(p.tree)));
}

export function renderIndex(pages) {
  const tree = { tag: 'main', attrs: {}, kids: [
    { tag: 'h1', attrs: {}, kids: ['Backgammon Tutor'] },
    { tag: 'ul', attrs: { class: 'toc' }, kids: pages.map(({ slug, title }) =>
      ({ tag: 'li', attrs: {}, kids: [{ tag: 'a', attrs: { href: '/' + slug }, kids: [title] }] })) },
  ] };
  return shell('Backgammon Tutor', html(tree));
}
