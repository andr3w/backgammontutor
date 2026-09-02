// Authoring helpers. Not used at build time or in the browser -- these are for
// working out a position before it becomes a board literal in a page.
//
//   node -e "…" and paste the result into pages/whatever.mjs
//
// Designing numerically and printing the literal is a good deal easier than
// counting checkers into a grid by hand, and `pos` refuses to build a position
// that does not have fifteen checkers a side.

/** A position from counts: pos({ x: {24:2, 13:5}, o: {…}, bar: {x:1} }). */
export function pos({ x = {}, o = {}, bar = {}, off = {} }) {
  const pts = {};
  for (const [p, n] of Object.entries(x)) if (n) pts[p] = { side: 'x', n };
  for (const [p, n] of Object.entries(o)) {
    if (!n) continue;
    // Both sides on one point is not a position, and letting o quietly
    // overwrite x loses a checker somewhere far from where you typed it.
    if (pts[p]) throw new Error(`point ${p} has both colours`);
    pts[p] = { side: 'o', n };
  }
  const full = { pts, bar: { x: 0, o: 0, ...bar }, off: { x: 0, o: 0, ...off } };
  for (const c of ['x', 'o']) {
    const t = Object.values(pts).filter(v => v.side === c).reduce((a, v) => a + v.n, 0)
      + full.bar[c] + full.off[c];
    if (t !== 15) throw new Error(`${c} has ${t} checkers, need 15`);
  }
  return full;
}

/** The reverse of lib/board.mjs: a position printed as the literal to type. */
export function source(b) {
  const top = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
  const bot = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const n = p => (b.pts[p] ? b.pts[p].n : 0);
  const ch = p => (b.pts[p] ? b.pts[p].side : '.');
  const h = Math.max(5, ...top.map(n), ...bot.map(n));
  const line = cs => cs.slice(0, 6).join('') + '||' + cs.slice(6).join('');
  const rows = [];
  for (let r = 0; r < h; r++) rows.push(line(top.map(p => (n(p) > r ? ch(p) : '.'))));
  rows.push('-'.repeat(14));
  for (let r = 0; r < h; r++) rows.push(line(bot.map(p => (n(p) > h - 1 - r ? ch(p) : '.'))));
  const extra = [];
  for (const k of ['bar', 'off'])
    for (const c of ['x', 'o']) if (b[k][c]) extra.push(`${k} ${c}${b[k][c]}`);
  return rows.join('\n') + (extra.length ? '\n' + extra.join('\n') : '');
}
