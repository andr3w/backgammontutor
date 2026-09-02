// Backgammon movement. Pure functions over the position shape produced by
// lib/board.mjs: { pts: {point: {side, n}}, bar: {x,o}, off: {x,o} }.
//
// Points are absolute and never flip: X moves 24 -> 1 and bears off from 1-6,
// O moves 1 -> 24 and bears off from 19-24. No module here knows about the
// DOM, so the build uses it too.

export const opp = s => (s === 'x' ? 'o' : 'x');

/** A roll as dice to spend: doubles are four. */
export const roll = d => (d[0] === d[1] ? [d[0], d[0], d[0], d[0]] : [...d]);
const step1 = s => (s === 'x' ? -1 : 1);

export const entryPoint = (s, d) => (s === 'x' ? 25 - d : d);
export const offDist    = (s, p) => (s === 'x' ? p : 25 - p);   // pips still to bear off

export function clone(pos) {
  const pts = {};
  for (const [p, v] of Object.entries(pos.pts)) pts[p] = { side: v.side, n: v.n };
  return { pts, bar: { ...pos.bar }, off: { ...pos.off } };
}

const at      = (pos, p) => pos.pts[p];
const blocked = (pos, p, side) => { const c = at(pos, p); return !!c && c.side !== side && c.n >= 2; };
const isHit   = (pos, p, side) => { const c = at(pos, p); return !!c && c.side !== side && c.n === 1; };

export const own = (pos, side) => Object.entries(pos.pts)
  .filter(([, v]) => v.side === side).map(([p, v]) => [+p, v.n]);

export function allHome(pos, side) {
  if (pos.bar[side]) return false;
  return own(pos, side).every(([p]) => offDist(side, p) <= 6);
}

/** Every legal single-checker move for one die. */
export function steps(pos, side, die) {
  if (pos.bar[side]) {
    const to = entryPoint(side, die);
    return blocked(pos, to, side) ? []
      : [{ from: 'bar', to, die, hit: isHit(pos, to, side) }];
  }
  const home = allHome(pos, side);
  // Bearing off with an oversized die is legal only from the furthest point back.
  const back = home ? Math.max(...own(pos, side).map(([p]) => offDist(side, p))) : 0;
  const out = [];
  for (const [p] of own(pos, side)) {
    const to = p + step1(side) * die;
    if (to >= 1 && to <= 24) {
      if (!blocked(pos, to, side)) out.push({ from: p, to, die, hit: isHit(pos, to, side) });
    } else if (home) {
      const d = offDist(side, p);
      if (die === d || (die > d && d === back)) out.push({ from: p, to: 'off', die, hit: false });
    }
  }
  return out;
}

export function apply(pos, side, st) {
  const n = clone(pos);
  if (st.from === 'bar') n.bar[side]--;
  else if (--n.pts[st.from].n === 0) delete n.pts[st.from];
  if (st.to === 'off') n.off[side]++;
  else {
    if (st.hit) { delete n.pts[st.to]; n.bar[opp(side)]++; }
    if (n.pts[st.to]) n.pts[st.to].n++;
    else n.pts[st.to] = { side, n: 1 };
  }
  return n;
}

/**
 * Every *maximal* play: the rules oblige you to use as many dice as you can,
 * and to use the larger die when only one will go. Offering only the first
 * steps of maximal plays is what stops a student walking into a position from
 * which the second die is dead.
 */
export function plays(pos, side, dice) {
  const grow = (p, ds) => {
    if (!ds.length) return [[]];
    const out = [], seen = new Set();
    ds.forEach((d, i) => {
      if (seen.has(d)) return;
      seen.add(d);
      const rest = ds.slice(0, i).concat(ds.slice(i + 1));
      for (const st of steps(p, side, d))
        for (const tail of grow(apply(p, side, st), rest)) out.push([st, ...tail]);
    });
    return out.length ? out : [[]];
  };
  let all = grow(pos, dice);
  const max = Math.max(...all.map(s => s.length));
  all = all.filter(s => s.length === max);
  if (max === 1 && dice.length >= 2 && dice[0] !== dice[1]) {
    const big = Math.max(...dice);
    if (all.some(s => s[0].die === big)) all = all.filter(s => s[0].die === big);
  }
  return max ? all : [];
}

// --- reading a position -------------------------------------------------

/** Points where `side` has a lone checker. */
export const blots = (pos, side) => own(pos, side).filter(([, n]) => n === 1).map(([p]) => p);

/**
 * Which single die numbers hit something of `side`.
 *
 * This is the reading duplication is about: two blots behind the same number
 * are one shot, two blots behind different numbers are two. Direct shots only
 * -- combinations matter but they are not what the idea is for.
 *
 * A checker on the bar has to come in before it can do anything else, so when
 * the opponent is on the bar only the entering numbers count.
 */
export function hitNumbers(pos, side) {
  const o = opp(side), fwd = step1(o);
  const nums = new Set();
  const targets = blots(pos, side);
  if (pos.bar[o]) {
    for (let d = 1; d <= 6; d++) if (targets.includes(entryPoint(o, d))) nums.add(d);
    return nums;
  }
  for (const p of targets)
    for (const [q] of own(pos, o)) {
      const d = (p - q) * fwd;
      if (d >= 1 && d <= 6) nums.add(d);
    }
  return nums;
}

/** How many of `side`'s blots the opponent can reach with a single die. */
export function directShots(pos, side) {
  const o = opp(side), fwd = step1(o);
  let n = 0;
  for (const p of blots(pos, side)) {
    const reach = own(pos, o).some(([q]) => {
      const d = (p - q) * fwd;
      return d >= 1 && d <= 6;
    }) || (pos.bar[o] > 0 && offDist(o, p) >= 19);
    if (reach) n++;
  }
  return n;
}

/** The longest run of consecutive points `side` holds. */
export function primeLength(pos, side) {
  const h = held(pos, side);
  let best = 0, run = 0;
  for (let p = 1; p <= 24; p++) {
    if (h.has(p)) { run++; if (run > best) best = run; } else run = 0;
  }
  return best;
}

/** How many points of its own home board `side` holds. */
export const boardPoints = (pos, side) =>
  [...held(pos, side)].filter(p => offDist(side, p) <= 6).length;

/** Points held by `side` with two or more checkers. */
export const held = (pos, side) => new Set(own(pos, side).filter(([, n]) => n >= 2).map(([p]) => p));

// --- writing a play down ------------------------------------------------

const rank = f => (f === 'bar' ? 26 : +f);

/** Steps -> gnubg-style notation: "8/5 6/5", "bar/20*", "13/11(2)", "6/off". */
export function notate(seq) {
  const runs = [];
  for (const st of seq) {
    // one checker moved twice reads as a single move, unless it hit on the way
    const prev = runs.find(r => r.to === st.from && !r.hit);
    if (prev) { prev.to = st.to; prev.hit = st.hit; }
    else runs.push({ from: st.from, to: st.to, hit: st.hit });
  }
  const counts = new Map();
  for (const r of runs) {
    const k = `${r.from}/${r.to}${r.hit ? '*' : ''}`;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const dest = k => (k.split('/')[1].startsWith('off') ? -1 : parseInt(k.split('/')[1], 10));
  return [...counts]
    .sort((a, b) => rank(b[0].split('/')[0]) - rank(a[0].split('/')[0]) || dest(b[0]) - dest(a[0]))
    .map(([k, n]) => (n > 1 ? `${k}(${n})` : k))
    .join(' ');
}
