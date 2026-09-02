// Finding the goals for a question.
//
// A question is only usable if some small set of goals is true of the play you
// mean and of no other play -- otherwise the page either marks a good play
// wrong or lets a bad one through. Rather than guessing a goal set and seeing
// whether checkPage complains, this works the other way round: give it the
// play you want and it returns the smallest sets of goals that pick out that
// play alone.
//
// Paired with an engine it becomes a search. Evaluate a batch of positions,
// keep the ones where the best play wins clearly, and ask this which of those
// can be expressed at all. What comes out is a shortlist of positions that are
// both sound and teachable, which is a much better starting point than a
// hunch. See verify.mjs.

import * as R from '../static/rules.mjs';
import { decide, after } from '../static/goals.mjs';

// Where the opponent keeps house -- the region a checker "escapes" from.
const DEEP = { x: [19, 24], o: [1, 6] };

export const sig = p => Object.entries(p.pts).sort((a, b) => a[0] - b[0])
  .map(([n, v]) => `${n}${v.side}${v.n}`).join(',') + `|${p.bar.x}${p.bar.o}|${p.off.x}${p.off.o}`;

/**
 * Every distinct position this roll can reach.
 *
 * Keyed by position, not by notation: 13/3(2) and 13/8(2) 8/3(2) are the same
 * play written two ways, and so are 8/4* 6/4 and 8/4 6/4*. Each outcome keeps
 * every spelling of itself in `moves`, because an engine will print whichever
 * one it likes and a comparison by name has to accept all of them.
 */
export function outcomes(before, side, dice) {
  const seen = new Map();
  for (const seq of R.plays(before, side, R.roll(dice))) {
    const pos = after(before, side, seq);
    const k = sig(pos);
    if (!seen.has(k)) seen.set(k, { move: R.notate(seq), moves: new Set(), pos });
    seen.get(k).moves.add(R.notate(seq));
  }
  return [...seen.values()].map(o => ({ ...o, moves: [...o.moves] }));
}

/** Every goal that is true of this play, as a candidate for describing it. */
export function facts(before, side, pos) {
  const out = [];
  const was = R.held(before, side), now = R.held(pos, side);
  for (const p of now) out.push({ kind: 'made', arg: p });
  for (const [ps, v] of Object.entries(pos.pts))
    if (v.side === side && v.n === 1) out.push({ kind: 'blot', arg: +ps });
  for (const p of was) if (!pos.pts[p] || pos.pts[p].side !== side) out.push({ kind: 'clear', arg: p });
  for (const [ps, v] of Object.entries(before.pts)) {
    const p = +ps;
    if (v.side !== side && v.n === 1 && pos.pts[p] && pos.pts[p].side === side)
      out.push({ kind: 'hits', arg: p });
    if (v.side === side && p >= DEEP[side][0] && p <= DEEP[side][1]
        && (pos.pts[p] && pos.pts[p].side === side ? pos.pts[p].n : 0) < v.n)
      out.push({ kind: 'escapes', arg: p });
  }
  const pl = R.primeLength(pos, side);
  if (pl >= 2) out.push({ kind: 'prime', arg: pl });
  const bp = R.boardPoints(pos, side);
  if (bp >= 1) out.push({ kind: 'board', arg: bp });
  if (R.borneOff(pos, side)) out.push({ kind: 'off', arg: R.borneOff(pos, side) });
  out.push({ kind: 'shots', arg: R.directShots(pos, side) });
  out.push({ kind: 'numbers', arg: R.hitNumbers(pos, side).size });
  return out;
}

const holds = (gs, before, side, pos) => {
  const d = decide(gs, before, pos, side);
  return d.length === gs.length && d.every(g => g.met);
};

function* combos(xs, k, start = 0, acc = []) {
  if (acc.length === k) { yield acc; return; }
  for (let i = start; i < xs.length; i++) yield* combos(xs, k, i + 1, [...acc, xs[i]]);
}

/**
 * analyse(before, side, dice, want)
 *   -> { move, goals, all, plays }   the smallest goal sets that pin `want`
 *   -> { move, goals: null, cand }   nothing under three goals will do it
 *   -> { error }                     `want` is not a legal play here
 *
 * `goals` is the first of `all`; they are equally valid and the choice between
 * them is editorial -- prefer the one that reads as teaching.
 */
export function analyse(before, side, dice, want, limit = 3) {
  const all = outcomes(before, side, dice);
  const target = all.find(v => v.move === want);
  if (!target) return { error: `"${want}" is not one of: ${all.map(v => v.move).join(', ')}` };
  const others = all.filter(v => sig(v.pos) !== sig(target.pos));
  const cand = facts(before, side, target.pos);
  for (let size = 1; size <= limit; size++) {
    const found = [];
    for (const combo of combos(cand, size))
      if (!others.some(o => holds(combo, before, side, o.pos))) found.push(combo);
    if (found.length) return { move: target.move, goals: found[0], all: found, plays: all.length };
  }
  return { move: target.move, goals: null, cand, plays: all.length };
}

export const show = gs => gs.map(g => `${g.kind}(${g.arg})`).join(' + ');
