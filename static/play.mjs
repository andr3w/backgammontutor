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

import { boardSvg, spot, GEO } from './board-svg.mjs';
import * as R from './rules.mjs';

const $m = globalThis.$m;   // m.js, loaded as a classic script before this one

// Medals persist per question, keyed by page and id. Storage can throw
// outright (private windows, blocked site data), so every touch is guarded and
// a page with no storage simply never remembers.
const KEY = 'bgtutor:solved';
const solved = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
})();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(solved)); } catch {} };

const CALL = {
  good: 'Well done.',
  bad: "That's not right.",
  unknown: 'Not yet analysed.',
};

class Play {
  constructor(section) {
    this.q = JSON.parse(section.dataset.q);
    this.side = this.q.side;
    this.area = section.querySelector('.board-area');
    this.answer = section.querySelector('.answer');
    this.hint = section.querySelector('.hint');
    this.undoBtn = section.querySelector('.undo');
    this.section = section;
    this.medal = section.querySelector('.medal');
    this.key = location.pathname + '#' + this.q.id;

    this.area.addEventListener('click', e => {
      const t = e.target;
      if (t.dataset && t.dataset.dice) this.swap();
      else if (t.dataset && t.dataset.p) this.tap(t.dataset.p);
    });
    this.undoBtn.addEventListener('click', () => this.undo());

    this.reset();
    this.draw();
    this.wear();
  }

  wear() {
    const won = !!solved[this.key];
    this.medal.hidden = !won;
    this.section.classList.toggle('won', won);
  }

  win() {
    if (solved[this.key]) return;
    solved[this.key] = Date.now();
    persist();
    this.wear();
    document.dispatchEvent(new CustomEvent('bg:progress'));
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
    const lifted = this.where(this.pos, st.from);
    this.pos = R.apply(this.pos, this.side, st);
    this.seq = [...this.seq, st];
    const d = this.dice.find(x => !x.spent && x.v === st.die);
    if (d) d.spent = true;
    this.cur = this.dice.findIndex(x => !x.spent);
    this.draw(st.to, lifted);
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
    const st = this.seq[back.n];
    const lifted = this.where(this.pos, st.to);
    this.pos = back.pos;
    this.dice.forEach((d, i) => { d.spent = back.spent[i]; });
    this.cur = back.cur;
    this.seq = this.seq.slice(0, back.n);
    this.draw(st.from, lifted);   // the checker walks back the way it came
  }

  /** Centre of the outermost checker at `where`, in board units. */
  where(pos, place) {
    if (place === 'bar') return spot('bar', this.side, pos.bar[this.side] - 1);
    if (place === 'off') return spot('off', this.side, pos.off[this.side] - 1);
    const n = pos.pts[place] ? pos.pts[place].n : 1;
    return spot(place, this.side, n - 1, n);
  }

  /**
   * The moved checker is already drawn where it lands; this walks it back to
   * where it came from and lets it fall, over a shallow arc away from the
   * nearer edge of the board.
   */
  fly(from) {
    const el = this.area.querySelector('.arrive');
    if (!el || !from || !el.animate) return;
    if (globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const num = a => +el.getAttribute(a);
    const cx = el.tagName === 'circle' ? num('cx') : num('x') + num('width') / 2;
    const cy = el.tagName === 'circle' ? num('cy') : num('y') + num('height') / 2;
    const dx = from.x - cx, dy = from.y - cy;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    const lift = (from.y > GEO.MID ? -1 : 1) * Math.min(6, d * 0.18);
    const frames = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      frames.push({ transform:
        `translate(${dx * (1 - t)}px, ${dy * (1 - t) + lift * 4 * t * (1 - t)}px)` });
    }
    el.animate(frames, { duration: 280, easing: 'ease-out' });
  }

  // --- drawing -----------------------------------------------------------
  draw(arrive = null, from = null) {
    const opts = this.options();
    const done = !opts.length;
    const now = this.dice[this.cur] && this.dice[this.cur].v;
    const reach = new Set(opts.map(s => s.from));
    const withNow = new Set(opts.filter(s => s.die === now).map(s => s.from));
    const highlight = done ? []
      : [...reach].map(p => ({ p, weak: !withNow.has(p) }));

    const svg = boardSvg($m, this.pos, {
      dice: this.dice, cur: done ? -1 : this.cur, turn: this.side,
      highlight, interactive: !done, arrive,
    });
    this.area.querySelector('.bg-board').replaceWith(svg);
    this.fly(from);

    this.undoBtn.hidden = !this.past.length;
    this.hint.hidden = done || !!this.past.length;
    if (done) this.report(); else this.answer.replaceChildren();
  }

  // --- what the play was, and what the page says about it ----------------
  report() {
    if (!this.seq.length) {
      this.answer.replaceChildren($m('p.played', 'There is no legal play with this roll.'));
      return;
    }
    const move = R.notate(this.seq);
    const v = this.judge(move);
    const said = $m(`div.verdict.${v.tone}`);
    said.innerHTML = v.html;
    this.answer.replaceChildren(
      $m('p.played', $m(`strong.call.${v.tone}`, CALL[v.tone]), ' You played ', $m('b', move), '.'),
      said);
    if (v.tone === 'good') this.win();
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
