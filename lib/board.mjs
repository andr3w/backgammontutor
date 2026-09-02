// board`...`  ->  { pts: {1..24}, bar:{x,o}, off:{x,o} }
export function board(strs, ...vals) {
  const raw = strs.reduce((a, s, i) => a + s + (vals[i] ?? ''), '');
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const extra = { bar: { x: 0, o: 0 }, off: { x: 0, o: 0 } };
  const rows = [];
  for (const l of lines) {
    const kw = l.match(/^(bar|off)\s+(.*)$/i);
    if (kw) { for (const [, c, n] of kw[2].matchAll(/([xo])\s*(\d+)/gi)) extra[kw[1].toLowerCase()][c.toLowerCase()] = +n; }
    else rows.push(l);
  }

  const half = Math.floor(rows.length / 2);
  const top = rows.slice(0, half), bot = rows.slice(rows.length - half);
  const cells = r => { const c = r.replace(/\|+/g, '').split(''); if (c.length !== 12) throw new Error(`row "${r}" has ${c.length} point columns, need 12`); return c; };

  const pts = {};
  const put = (p, ch) => { if (ch === 'x' || ch === 'o') { pts[p] ??= { side: ch, n: 0 }; if (pts[p].side !== ch) throw new Error(`point ${p} has both colours`); pts[p].n++; } };
  top.forEach(r => cells(r).forEach((ch, col) => put(13 + col, ch)));
  bot.forEach(r => cells(r).forEach((ch, col) => put(12 - col, ch)));

  for (const c of ['x', 'o']) {
    const total = Object.values(pts).filter(p => p.side === c).reduce((a, p) => a + p.n, 0) + extra.bar[c] + extra.off[c];
    if (total !== 15) throw new Error(`${c} has ${total} checkers, need 15`);
  }
  return { pts, ...extra };
}

// on-roll player's frame: their points are UPPERCASE, numbered 1..24 from their ace point
export function toXGID(b, { turn = 'x', dice = '00', cube = 0, owner = 0, score = [0, 0], flag = 0, len = 0 } = {}) {
  const me = turn, L = 'abcdefghijklmno';
  const slot = new Array(26).fill('-');
  for (const [p, { side, n }] of Object.entries(b.pts)) {
    const i = me === 'x' ? +p : 25 - +p;                 // renumber if O is on roll
    slot[i] = side === me ? L[n - 1].toUpperCase() : L[n - 1];
  }
  const opp = me === 'x' ? 'o' : 'x';
  if (b.bar[me]) slot[25] = L[b.bar[me] - 1].toUpperCase();
  if (b.bar[opp]) slot[0] = L[b.bar[opp] - 1];
  return `XGID=${slot.join('')}:${cube}:${owner}:${turn === 'x' ? 1 : -1}:${dice}:${score[0]}:${score[1]}:${flag}:${len}:10`;
}
