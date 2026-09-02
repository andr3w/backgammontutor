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

const SLAB = 2.6, SLAB_STEP = 3.1;  // borne-off checkers lie flat in the tray

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

/**
 * Centre of one checker, wherever it is. The animation needs to know where a
 * checker was before the position changed and where it has landed, so this has
 * to agree exactly with what the drawing code below does.
 */
export function spot(place, side, i, n) {
  if (place === 'bar') return {
    x: BARX + BAR / 2,
    y: side === 'x' ? MID - GAP / 2 - CK * (i + 0.5) : MID + GAP / 2 + CK * (i + 0.5),
  };
  if (place === 'off') return {
    x: TRAYX + TRAY / 2,
    y: side === 'x' ? BOT - 1 - SLAB / 2 - i * SLAB_STEP : TOP + 1 + SLAB / 2 + i * SLAB_STEP,
  };
  return { x: colX(pointCol(place)) + PW / 2, y: checkerY(place, i, n) };
}

const pips = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]],
};

const DIE = 9, DIE_GAP = 10.5;

function die($m, n, cx, cy, cls) {
  const r = DIE / 2, u = DIE * 0.28;
  return $m(`s:g.${cls}`,
    $m('s:rect.die-face', { x: cx - r, y: cy - r, width: DIE, height: DIE, rx: DIE * 0.18 }),
    ...(pips[n] || []).map(([px, py]) =>
      $m('s:circle.pip', { cx: cx + px * u, cy: cy + py * u, r: DIE * 0.09 })));
}

function stack($m, p, side, n, arriving = false) {
  const cx = colX(pointCol(p)) + PW / 2, r = CK / 2 - 0.35;
  const out = [];
  for (let i = 0; i < n; i++)
    out.push($m(`s:circle.ck.${side}${arriving && i === n - 1 ? '.arrive' : ''}`,
      { cx, cy: checkerY(p, i, n), r }));
  if (n > 5) out.push($m(`s:text.count`, { x: cx, y: checkerY(p, n - 1, n) + 1.4 }, String(n)));
  return out;
}

/**
 * pos   a parsed board literal: { pts: {p: {side, n}}, bar, off }
 * opts  dice        [3, 1] or [{ v, spent }, ...]; doubles pass four
 *       cur         index of the die a tap will use next
 *       highlight   [7, {p: 13, weak: true}, ...]
 *       interactive emit the transparent tap targets
 *       arrive      the point / 'bar' / 'off' a checker has just reached; its
 *                   outermost checker is tagged so it can be animated in
 */
export function boardSvg($m, pos, opts = {}) {
  const { dice = null, cur = -1, turn = 'x', highlight = [],
          interactive = false, arrive = null } = opts;
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
  for (const [p, { side, n }] of Object.entries(pos.pts))
    kids.push(...stack($m, +p, side, n, arrive === +p));

  // checkers on the bar: each side stacks toward the quadrant it enters in
  for (const c of ['x', 'o'])
    for (let i = 0; i < (pos.bar[c] || 0); i++) {
      const { x, y } = spot('bar', c, i);
      const last = arrive === 'bar' && i === pos.bar[c] - 1;
      kids.push($m(`s:circle.ck.${c}${last ? '.arrive' : ''}`, { cx: x, cy: y, r: CK / 2 - 0.35 }));
    }

  // borne off: flat slabs in the tray, x below, o above
  for (const c of ['x', 'o'])
    for (let i = 0; i < (pos.off[c] || 0); i++) {
      const { x, y } = spot('off', c, i);
      const last = arrive === 'off' && i === pos.off[c] - 1;
      kids.push($m(`s:rect.ck.${c}.borne${last ? '.arrive' : ''}`,
        { x: x - (TRAY - 4) / 2, y: y - SLAB / 2, width: TRAY - 4, height: SLAB, rx: 0.6 }));
    }

  // dice, in the well on the side of the player on roll
  if (dice && dice.length) {
    const ds = dice.map(d => (typeof d === 'number' ? { v: d } : d));
    const half = turn === 'x' ? 9 : 3;               // middle of a half
    const cx = FRAME + half * PW + (half >= 6 ? BAR : 0);
    const x0 = cx - (ds.length - 1) * DIE_GAP / 2;
    const g = ds.map((d, i) => die($m, d.v, x0 + i * DIE_GAP, MID,
      `die${d.spent ? '.spent' : ''}${i === cur ? '.now' : ''}`));
    // One target over the whole roll -- switching die is the only thing the
    // dice do, and only when there are two different ones left to switch
    // between. Doubles get no target: there is nothing to switch to.
    const open = ds.filter(d => !d.spent);
    if (interactive && new Set(open.map(d => d.v)).size > 1)
      g.push($m('s:rect.hit', { 'data-dice': '1',
        x: x0 - DIE_GAP / 2 - 1, y: MID - DIE, width: ds.length * DIE_GAP + 2, height: DIE * 2 }));
    kids.push($m('s:g.dice-group', ...g));
  }

  // Highlights sit above the checkers; the tap targets go above everything.
  // A point gets a target exactly when it is highlighted, so the pointer
  // cursor never appears anywhere a tap would do nothing.
  const box = p => p === 'bar'
    ? { x: BARX, y: TOP, width: BAR, height: H }
    : { x: colX(pointCol(p)), y: isTop(p) ? TOP : BOT - HALF, width: PW, height: HALF };
  const targets = [];
  for (const h of highlight) {
    const p = typeof h === 'number' ? h : h.p;
    const weak = typeof h === 'number' ? false : !!h.weak;
    kids.push($m(`s:rect.lit${weak ? '.weak' : ''}`, { ...box(p), rx: 1 }));
    if (interactive) targets.push($m('s:rect.hit', { 'data-p': p, ...box(p) }));
  }
  kids.push(...targets);

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
