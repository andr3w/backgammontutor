// Tap to move.
//
// One tap plays a checker: the die under the marker if it will go from there,
// otherwise the other one. Tapping the dice moves the marker. Undo steps back
// a single die, not a whole play, so a wrong second tap does not throw away
// the first. There is no submit button -- the play is complete when the dice
// are gone, and undo backs out of it, so a graded answer is not a closed door.
//
// Only the first steps of *maximal* plays are offered (see rules.mjs), which
// is what stops a student stranding themselves with an unplayable second die.

import { boardSvg } from './board-svg.mjs';
import * as R from './rules.mjs';

const $m = globalThis.$m;   // m.js, loaded as a classic script before this one

class Play {
  constructor(section) {
    this.q = JSON.parse(section.dataset.q);
    this.side = this.q.side;
    this.area = section.querySelector('.board-area');
    this.answer = section.querySelector('.answer');
    this.hint = section.querySelector('.hint');
    this.undoBtn = section.querySelector('.undo');

    this.area.addEventListener('click', e => {
      const t = e.target;
      if (t.dataset && t.dataset.dice) this.swap();
      else if (t.dataset && t.dataset.p) this.tap(t.dataset.p);
    });
    this.undoBtn.addEventListener('click', () => this.undo());

    this.reset();
    this.draw();
  }

  reset() {
    this.pos = this.q.pos;
    this.dice = R.roll(this.q.dice).map(v => ({ v, spent: false }));
    this.cur = 0;
    this.seq = [];
    this.past = [];
  }

  // --- what is playable right now ---------------------------------------
  get left() { return this.dice.filter(d => !d.spent).map(d => d.v); }

  options() {
    if (!this.left.length) return [];
    return R.plays(this.pos, this.side, this.left).map(p => p[0]);
  }

  // --- gestures ----------------------------------------------------------
  tap(p) {
    const from = p === 'bar' ? 'bar' : +p;
    const here = this.options().filter(s => s.from === from);
    if (!here.length) return;
    const now = this.dice[this.cur] && this.dice[this.cur].v;
    const st = here.find(s => s.die === now) || here[0];

    this.past.push({ pos: this.pos, spent: this.dice.map(d => d.spent), cur: this.cur, n: this.seq.length });
    this.pos = R.apply(this.pos, this.side, st);
    this.seq = [...this.seq, st];
    const d = this.dice.find(x => !x.spent && x.v === st.die);
    if (d) d.spent = true;
    this.cur = this.dice.findIndex(x => !x.spent);
    this.draw();
  }

  swap() {
    const open = this.dice.map((d, i) => (d.spent ? -1 : i)).filter(i => i >= 0);
    if (open.length < 2) return;
    this.cur = open[(open.indexOf(this.cur) + 1) % open.length];
    this.draw();
  }

  undo() {
    const back = this.past.pop();
    if (!back) return;
    this.pos = back.pos;
    this.dice.forEach((d, i) => { d.spent = back.spent[i]; });
    this.cur = back.cur;
    this.seq = this.seq.slice(0, back.n);
    this.draw();
  }

  // --- drawing -----------------------------------------------------------
  draw() {
    const opts = this.options();
    const done = !opts.length;
    const now = this.dice[this.cur] && this.dice[this.cur].v;
    const reach = new Set(opts.map(s => s.from));
    const withNow = new Set(opts.filter(s => s.die === now).map(s => s.from));
    const highlight = done ? []
      : [...reach].map(p => ({ p, weak: !withNow.has(p) }));

    const svg = boardSvg($m, this.pos, {
      dice: this.dice, cur: done ? -1 : this.cur, turn: this.side,
      highlight, interactive: !done,
    });
    this.area.querySelector('.bg-board').replaceWith(svg);

    this.undoBtn.hidden = !this.past.length;
    this.hint.hidden = done || !!this.past.length;
    if (done) this.report(); else this.answer.replaceChildren();
  }

  // --- what the play was, and what the page says about it ----------------
  report() {
    const move = R.notate(this.seq);
    const out = [];
    if (!this.seq.length) {
      out.push($m('p.played', 'There is no legal play with this roll.'));
    } else {
      out.push($m('p.played', 'You played ', $m('b', move)));
      const verdict = this.judge(move);
      out.push($m(`div.verdict.${verdict.tone}`));
      out[out.length - 1].innerHTML = verdict.html;
    }
    this.answer.replaceChildren(...out);
  }

  judge(move) {
    const goals = (this.q.goals || []).map(g => ({ ...g, met: this.meets(g) }));
    const judged = goals.filter(g => g.met !== null);
    if (judged.length && judged.every(g => g.met))
      return { tone: 'good', html: judged.map(g => g.why).filter(Boolean).join('') || '<p>That is the play.</p>' };
    if (this.q.traps && this.q.traps[move])
      return { tone: 'bad', html: this.q.traps[move] };
    if (this.q.otherwise) return { tone: 'bad', html: this.q.otherwise };
    // CLAUDE.md: a legal play with no stored analysis is not something to guess at.
    console.warn('unanalysed play', this.q.id, move);
    return { tone: 'unknown', html: '<p>This play has not been analysed yet.</p>' };
  }

  /** true / false / null when the goal is not one we can decide structurally. */
  meets(g) {
    const before = this.q.pos, after = this.pos;
    if (g.kind === 'makes')
      return R.held(after, this.side).has(g.arg) && !R.held(before, this.side).has(g.arg);
    if (g.kind === 'shots') return R.directShots(after, this.side) === g.arg;
    return null;
  }
}

for (const s of document.querySelectorAll('.screen-question[data-q]')) new Play(s);
