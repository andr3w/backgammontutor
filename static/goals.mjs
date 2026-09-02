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
  // --- state: what the board looks like when the play is over ---------
  //
  // A point is in one of three conditions and each has its own predicate:
  // made (two or more of yours), blot (exactly one), clear (none). Nothing
  // quietly lumps the lone checker in with one of the others, because that is
  // the condition a student most needs telling about.
  const mine = pos => (pos.pts[g.arg] && pos.pts[g.arg].side === side ? pos.pts[g.arg].n : 0);
  if (g.kind === 'made')  return mine(after) >= 2;
  if (g.kind === 'blot')  return mine(after) === 1;
  if (g.kind === 'clear') return mine(after) === 0;
  if (g.kind === 'shots') return R.directShots(after, side) === g.arg;

  // --- event: what the play did on the way ----------------------------
  //
  // These cannot be written as states. The position after 8/4* is the same
  // position you would reach by occupying the 4 point with his checker already
  // on the bar, so "did you hit" is not a question the end position can
  // answer. Nor is "did a checker leave the 24 point".
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
  return null;   // no predicate: never read as a failure
}

/** What to say about a missed goal when the page did not say it itself. */
export function missed(g, before, after, side) {
  if (g.kind === 'made') {
    // the predicate is a state, but the explanation can look at where the
    // student started -- losing a point and never making one read differently
    return R.held(before, side).has(g.arg)
      ? `<p>You gave up the ${g.arg} point.</p>`
      : `<p>You had the chance to make the ${g.arg} point.</p>`;
  }
  if (g.kind === 'clear') {
    const left = after.pts[g.arg];
    return left && left.side === side && left.n === 1
      ? `<p>You left a checker behind on the ${g.arg} point.</p>`
      : `<p>The ${g.arg} point has to go.</p>`;
  }
  if (g.kind === 'blot') return `<p>The ${g.arg} point wants exactly one checker on it.</p>`;
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
