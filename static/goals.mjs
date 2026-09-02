// What a goal means. One definition, used by the grader in the browser and by
// the checker at build time, so a question cannot be validated against rules
// the student is then graded by differently.

import * as R from './rules.mjs';

/**
 * Did the play meet this goal?
 * true / false, or null when we have no predicate for it -- an unknown goal
 * kind must not read as a failure.
 */
export function meets(g, before, after, side) {
  if (g.kind === 'makes')
    return R.held(after, side).has(g.arg) && !R.held(before, side).has(g.arg);
  if (g.kind === 'keeps')
    return R.held(after, side).has(g.arg);
  if (g.kind === 'hits') {
    const was = before.pts[g.arg];
    if (!was || was.side === side || was.n !== 1) return false;   // nothing to hit
    const now = after.pts[g.arg];
    return !!now && now.side === side;
  }
  if (g.kind === 'escapes') {
    const was = before.pts[g.arg], now = after.pts[g.arg];
    if (!was || was.side !== side) return false;
    return (now && now.side === side ? now.n : 0) < was.n;
  }
  if (g.kind === 'shots')
    return R.directShots(after, side) === g.arg;
  return null;
}

/** What to say about a missed goal when the page did not say it itself. */
export function missed(g, after, side) {
  if (g.kind === 'makes') return `<p>You had the chance to make the ${g.arg} point.</p>`;
  if (g.kind === 'keeps') return `<p>You gave up the ${g.arg} point to do it.</p>`;
  if (g.kind === 'hits') return `<p>There is a checker of his on the ${g.arg} point, and you left it there.</p>`;
  if (g.kind === 'escapes') return `<p>A checker on the ${g.arg} point wanted to leave.</p>`;
  if (g.kind === 'shots') {
    const n = R.directShots(after, side);
    return n === 0
      ? '<p>That play was meant to leave a blot.</p>'
      : `<p>That leaves ${n === 1 ? 'a checker' : n + ' checkers'} where he can `
        + 'hit with a single die.</p>';
  }
  return '<p>That is not the idea here.</p>';
}

/** Goals we can decide, in the order they were written. */
export const decide = (goals, before, after, side) =>
  (goals || []).map(g => ({ ...g, met: meets(g, before, after, side) }))
    .filter(g => g.met !== null);

/** Play out a sequence of steps and return the resulting position. */
export const after = (pos, side, seq) => seq.reduce((p, st) => R.apply(p, side, st), pos);
