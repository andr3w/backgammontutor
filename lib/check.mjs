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
import { decide, meets, after } from '../static/goals.mjs';

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

    // A goal that is true of every legal play narrows nothing, and one that is
    // true of none makes the question unanswerable. State goals make both easy
    // to write by accident -- made(6) on an opening position is true whatever
    // you play -- and neither announces itself.
    for (const g of q.goals || []) {
      if (undecidable.includes(g)) continue;
      const n = [...legal.values()].filter(pos => meets(g, q.board, pos, side)).length;
      if (n === legal.size)
        say('warn', q.id, `goal ${g.kind}(${g.arg}) is true whatever you play, so it asks nothing`);
      else if (n === 0)
        say('error', q.id, `goal ${g.kind}(${g.arg}) is true of no legal play`);
    }

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

/**
 * Does every question offer the student a point they could have made?
 *
 * Not a correctness check -- a question with no build is perfectly valid. It
 * is the premise of the "build points" pages: the lesson is that building is
 * the default and something else is sometimes better, and a question where no
 * build exists does not put that choice in front of anyone. Four of the medium
 * page's ten had quietly lost it.
 */
export function checkBuildChoice(page) {
  const out = [];
  page.questions.forEach((q, i) => {
    const side = q.turn || 'x';
    const was = R.held(q.board, side);
    const builds = R.plays(q.board, side, R.roll(q.dice))
      .map(seq => after(q.board, side, seq))
      .filter(pos => [...R.held(pos, side)].some(p => !was.has(p)));
    if (!builds.length)
      out.push({ level: 'warn', id: `${i + 1} ${q.id}`, msg: 'no legal play makes a point, so the question offers no choice to make' });
  });
  return out;
}

export function report(problems, where) {
  for (const p of problems)
    console.error(`  ${p.level === 'error' ? 'ERROR' : 'warn '} ${where}#${p.id}: ${p.msg}`);
  return problems.some(p => p.level === 'error');
}
