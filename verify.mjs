#!/usr/bin/env node
// node verify.mjs <slug>            what each question accepts, as XGIDs
// node verify.mjs <slug> --gnubg    ask gnubg whether that is the best play
// node verify.mjs <slug> --suggest  goal sets that would pin gnubg's choice
//
// checkPage (run by the build) proves a question is *answerable*: some play
// meets the goals and only one does. It cannot tell you whether that play is
// any good. Only an engine can, so this asks one.
//
// gnubg runs on another machine here; --gnubg copies a script over and reads
// the answer back. Set GNUBG_SSH to the host (default: laalaa).

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toXGID } from './lib/board.mjs';
import { analyse, outcomes, show } from './lib/goalfind.mjs';
import { decide } from './static/goals.mjs';
import * as R from './static/rules.mjs';

const [slug, ...flags] = process.argv.slice(2);
if (!slug) { console.error('usage: verify.mjs <slug> [--gnubg] [--suggest]'); process.exit(2); }
const page = (await import(new URL(`pages/${slug}.mjs`, import.meta.url))).default;

// What the page's goals accept, and every way of writing it.
const rows = page.questions.map(q => {
  const side = q.turn || 'x';
  const good = outcomes(q.board, side, q.dice).filter(o => {
    const d = decide(q.goals, q.board, o.pos, side);
    return d.length && d.every(g => g.met);
  });
  return { q, side, xgid: toXGID(q.board, { turn: side, dice: q.dice.join('') }), good };
});

if (!flags.length) {
  for (const r of rows) console.log([r.q.id, r.xgid, r.good.flatMap(g => g.moves).join(' | ')].join('\t'));
  process.exit(0);
}

// --- ask gnubg -----------------------------------------------------------
// Match scores would need one gnubg process per position: driven as a batch,
// gnubg carries match state from one `set xgid` to the next and reports
// equities for the wrong context -- silently, and by margins large enough to
// look like findings. Nothing leaks between money positions, so the batch is
// safe for everything built so far.
const scored = rows.filter(r => (r.q.score && (r.q.score[0] || r.q.score[1])) || r.q.matchLength);
if (scored.length) {
  console.error('verify.mjs drives gnubg as one batch, which is only sound for money play.');
  console.error('These questions carry a match score: ' + scored.map(r => r.q.id).join(', '));
  process.exit(2);
}

const HINT = `import gnubg
gnubg.command("set evaluation chequer eval plies 3")
gnubg.command("set evaluation chequer eval prune off")
for line in open("/tmp/verify-ids.tsv"):
    qid, xgid = line.strip().split("\\t")
    gnubg.command("new game")
    gnubg.command("set xgid " + xgid)
    h = gnubg.hint(5)["hint"]
    gap = abs(h[1]["eqdiff"]) if len(h) > 1 else 9.0
    print("%s\\t%s\\t%.4f" % (qid, h[0]["move"], gap))
`;
const host = process.env.GNUBG_SSH || 'laalaa';
const dir = mkdtempSync(join(tmpdir(), 'verify-'));
writeFileSync(join(dir, 'verify-ids.tsv'), rows.map(r => `${r.q.id}\t${r.xgid}`).join('\n') + '\n');
writeFileSync(join(dir, 'verify-hint.py'), HINT);
execFileSync('scp', ['-q', join(dir, 'verify-ids.tsv'), join(dir, 'verify-hint.py'), `${host}:/tmp/`]);
const out = execFileSync('ssh', [host, 'gnubg -t -q -p /tmp/verify-hint.py'],
  { encoding: 'utf8', maxBuffer: 1 << 24 });
const best = new Map(out.split('\n')
  .map(l => l.split('\t')).filter(c => c.length === 3 && rows.some(r => r.q.id === c[0]))
  .map(([id, move, gap]) => [id, { move, gap: +gap }]));

// Equity loss to the runner-up, against the bands in CLAUDE.md. A question
// whose second-best play is within 0.020 is not one to mark wrong.
const band = g => (g < 0.020 ? 'NEGLIGIBLE' : g < 0.040 ? 'doubtful' : g < 0.080 ? 'error' : 'blunder');
let bad = 0;
console.log('question        gnubg best           accepted  margin');
for (const r of rows) {
  const b = best.get(r.q.id);
  if (!b) { console.log(`${r.q.id.padEnd(16)}(no answer from gnubg)`); bad++; continue; }
  const ok = r.good.some(g => g.moves.includes(b.move));   // any spelling of an accepted play
  if (!ok || b.gap < 0.020) bad++;
  console.log(r.q.id.padEnd(16) + b.move.padEnd(21)
    + (ok ? 'yes   ' : 'NO    ') + b.gap.toFixed(3).padStart(7) + '  ' + band(b.gap));
  if (flags.includes('--suggest') && !ok) {
    const a = analyse(r.q.board, r.side, r.q.dice, b.move);
    console.log('    goals that would pin it: '
      + (a.error || (a.goals ? a.all.map(show).join('   |   ') : 'none under three goals')));
  }
}
console.log(bad ? `\n${bad} question(s) need attention` : '\nall good');
process.exit(bad ? 1 : 0);
