// Static analysis of a page, run at build time.
//
// The questions are fixed, so everything about them can be checked before a
// student ever sees one. Three things go wrong in authoring and none of them
// announce themselves at runtime:
//
//   - a trap keyed to a play that is not legal from that position, which
//     simply never fires;
//   - goals no legal play can satisfy, so the question cannot be answered;
//   - goals more than one play satisfies, so "the" answer is ambiguous.

import * as R from '../static/rules.mjs';
import { decide, after } from '../static/goals.mjs';

/** A position, as a string, for comparing two plays that end up the same. */
const sig = pos => Object.entries(pos.pts).sort((a, b) => a[0] - b[0])
  .map(([p, v]) => `${p}${v.side}${v.n}`).join(',')
  + `|${pos.bar.x}${pos.bar.o}|${pos.off.x}${pos.off.o}`;

export function checkPage(page) {
  const problems = [];
  const say = (level, id, msg) => problems.push({ level, id, msg });

  for (const q of page.questions) {
    const side = q.turn || 'x';
    const dice = R.roll(q.dice);
    const legal = new Map();               // notation -> resulting position
    for (const seq of R.plays(q.board, side, dice))
      legal.set(R.notate(seq), after(q.board, side, seq));

    if (!legal.size) { say('error', q.id, `roll ${q.dice.join('-')} has no legal play`); continue; }

    for (const key of Object.keys(q.traps || {}))
      if (!legal.has(key))
        say('error', q.id, `trap "${key}" is not a legal play, so it can never fire`
          + `\n      legal plays: ${[...legal.keys()].sort().join(', ')}`);

    const undecidable = (q.goals || []).filter(g => !decide([g], q.board, q.board, side).length);
    for (const g of undecidable)
      say('warn', q.id, `goal ${g.kind}(${g.arg}) has no predicate, so it is never checked`);

    if ((q.goals || []).length > undecidable.length) {
      // Count distinct *positions*, not distinct notations: 13/8(2) 8/3(2) and
      // 13/3(2) are the same play written two ways, and the student is graded
      // on where the checkers end up.
      const seen = new Map();
      for (const [move, pos] of legal) {
        const d = decide(q.goals, q.board, pos, side);
        if (d.length && d.every(g => g.met) && !seen.has(sig(pos))) seen.set(sig(pos), move);
      }
      const solutions = [...seen.values()];
      if (!solutions.length)
        say('error', q.id, 'no legal play meets the goals, so the question cannot be answered');
      else if (solutions.length > 1)
        say('warn', q.id, `${solutions.length} plays meet the goals: ${solutions.join(', ')}`);
    }
  }
  return problems;
}

export function report(problems, where) {
  for (const p of problems)
    console.error(`  ${p.level === 'error' ? 'ERROR' : 'warn '} ${where}#${p.id}: ${p.msg}`);
  return problems.some(p => p.level === 'error');
}
