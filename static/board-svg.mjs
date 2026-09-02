// The board, drawn once for both backends.
//
// $m is passed in rather than imported so this file works unchanged on the
// server (lib/kit.mjs, building an inspectable tree) and in the browser
// (static/m.js, building DOM). Element names carry the `s:` namespace prefix
// that m.js needs; the server backend strips it.
//
// Geometry is in board units, fixed by the viewBox. Nothing here knows about
// pixels, so the same numbers hold at 320px and at 1200px.

const PW    = 10;   // width of one point column
const BAR   = 12;   // the bar
const TRAY  = 13;   // borne-off tray, outside the frame on the right
const FRAME = 6;    // surround, doubles as the point-number gutter
const HALF  = 45;   // triangle length: also five checkers at full spacing
const GAP   = 10;   // the well between the halves, where the dice sit
const CK    = 9;    // checker diameter at full spacing

const H    = HALF * 2 + GAP;                   // 100
const W    = FRAME * 2 + PW * 12 + BAR + TRAY; // 157
const TOP  = FRAME;
const BOT  = FRAME + H;
const MID  = FRAME + HALF + GAP / 2;
const BARX = FRAME + 6 * PW;
const TRAYX= FRAME * 2 + PW * 12 + BAR;

export const GEO = { PW, BAR, TRAY, FRAME, HALF, GAP, CK, W, H, TOP, BOT, MID, BARX, TRAYX };

// Column 0..11, left to right. Top row is points 13..24, bottom row 12..1.
export const colX  = c => FRAME + c * PW + (c >= 6 ? BAR : 0);
export const pointCol = p => p >= 13 ? p - 13 : 12 - p;
export const isTop = p => p >= 13;

// Where the i'th checker of a stack of n sits on point p.
export function checkerY(p, i, n) {
  const s = Math.min(CK, HALF / n);
  return isTop(p) ? TOP + s * (i + 0.5) : BOT - s * (i + 0.5);
}

const pips = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
};

function die($m, n, cx, cy, size) {
  const r = size / 2, u = size * 0.28;
  return $m('s:g.die',
    $m('s:rect.die-face', { x: cx - r, y: cy - r, width: size, height: size, rx: size * 0.18 }),
    ...(pips[n] || []).map(([px, py]) =>
      $m('s:circle.pip', { cx: cx + px * u, cy: cy + py * u, r: size * 0.09 })));
}

function stack($m, p, side, n) {
  const cx = colX(pointCol(p)) + PW / 2, r = CK / 2 - 0.35;
  const out = [];
  for (let i = 0; i < n; i++)
    out.push($m(`s:circle.ck.${side}`, { cx, cy: checkerY(p, i, n), r }));
  if (n > 5) out.push($m(`s:text.count`, { x: cx, y: checkerY(p, n - 1, n) + 1.4 }, String(n)));
  return out;
}

/**
 * pos   a parsed board literal: { pts: {p: {side, n}}, bar, off }
 * opts  { dice, turn, highlight, interactive }
 */
export function boardSvg($m, pos, opts = {}) {
  const { dice = null, turn = 'x', highlight = [], interactive = false } = opts;
  const lit = new Set(highlight);
  const kids = [];

  kids.push($m('s:rect.frame', { x: 0, y: 0, width: W, height: H + FRAME * 2, rx: 2 }));
  kids.push($m('s:rect.felt', { x: FRAME, y: TOP, width: PW * 12 + BAR, height: H }));
  kids.push($m('s:rect.bar', { x: BARX, y: TOP, width: BAR, height: H }));
  kids.push($m('s:rect.tray', { x: TRAYX, y: TOP, width: TRAY, height: H, rx: 1 }));

  // triangles
  for (let c = 0; c < 12; c++) {
    const x = colX(c), shade = c % 2 ? 'b' : 'a';
    kids.push($m(`s:polygon.pt.${shade}`,
      { points: `${x},${TOP} ${x + PW},${TOP} ${x + PW / 2},${TOP + HALF}` }));
    kids.push($m(`s:polygon.pt.${c % 2 ? 'a' : 'b'}`,
      { points: `${x},${BOT} ${x + PW},${BOT} ${x + PW / 2},${BOT - HALF}` }));
  }

  // point numbers, in the frame gutter
  for (let c = 0; c < 12; c++) {
    const x = colX(c) + PW / 2;
    kids.push($m('s:text.num', { x, y: TOP - 1.6 }, String(13 + c)));
    kids.push($m('s:text.num', { x, y: BOT + FRAME - 1.6 }, String(12 - c)));
  }

  // checkers on points
  for (const [p, { side, n }] of Object.entries(pos.pts)) kids.push(...stack($m, +p, side, n));

  // checkers on the bar: each side stacks toward the quadrant it enters in
  const bcx = BARX + BAR / 2;
  for (let i = 0; i < (pos.bar.x || 0); i++)
    kids.push($m('s:circle.ck.x', { cx: bcx, cy: MID - GAP / 2 - CK * (i + 0.5), r: CK / 2 - 0.35 }));
  for (let i = 0; i < (pos.bar.o || 0); i++)
    kids.push($m('s:circle.ck.o', { cx: bcx, cy: MID + GAP / 2 + CK * (i + 0.5), r: CK / 2 - 0.35 }));

  // borne off: flat slabs in the tray, x below, o above
  const tw = TRAY - 4, tx = TRAYX + 2, th = 2.6;
  for (let i = 0; i < (pos.off.o || 0); i++)
    kids.push($m('s:rect.ck.o.borne', { x: tx, y: TOP + 1 + i * (th + 0.5), width: tw, height: th, rx: 0.6 }));
  for (let i = 0; i < (pos.off.x || 0); i++)
    kids.push($m('s:rect.ck.x.borne', { x: tx, y: BOT - 1 - th - i * (th + 0.5), width: tw, height: th, rx: 0.6 }));

  // dice, in the well on the side of the player on roll
  if (dice) {
    const side = turn === 'x' ? 9 : 3;               // middle of a half
    const cx = FRAME + side * PW + (side >= 6 ? BAR : 0);
    kids.push($m('s:g.dice-group', interactive ? { 'data-dice': '1' } : {},
      ...dice.map((n, i) => die($m, n, cx + (i ? 5.5 : -5.5), MID, 9))));
  }

  // highlights sit above the checkers, hit targets above everything
  for (const p of lit) {
    const x = colX(pointCol(p));
    kids.push($m('s:rect.lit', isTop(p)
      ? { x, y: TOP, width: PW, height: HALF, rx: 1 }
      : { x, y: BOT - HALF, width: PW, height: HALF, rx: 1 }));
  }
  if (interactive) {
    for (let p = 1; p <= 24; p++) {
      const x = colX(pointCol(p));
      kids.push($m('s:rect.hit', { 'data-p': p, x, y: isTop(p) ? TOP : BOT - HALF, width: PW, height: HALF }));
    }
    kids.push($m('s:rect.hit', { 'data-p': 'bar', x: BARX, y: TOP, width: BAR, height: H }));
    kids.push($m('s:rect.hit', { 'data-p': 'off', x: TRAYX, y: TOP, width: TRAY, height: H }));
  }

  return $m('s:svg.bg-board', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: `0 0 ${W} ${H + FRAME * 2}`,
    role: 'img',
    'aria-label': describe(pos, dice),
  }, ...kids);
}

// The crawler's board, and the screen reader's.
export function describe(pos, dice) {
  const side = c => Object.entries(pos.pts)
    .filter(([, v]) => v.side === c)
    .sort((a, b) => b[0] - a[0])
    .map(([p, v]) => `${v.n} on ${p}`).join(', ');
  const bar = c => pos.bar[c] ? `, ${pos.bar[c]} on the bar` : '';
  return `Backgammon position. X: ${side('x')}${bar('x')}. O: ${side('o')}${bar('o')}.`
    + (dice ? ` Roll ${dice.join('-')}.` : '');
}
