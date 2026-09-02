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
import { decide, missed } from './goals.mjs';

const $m = globalThis.$m;   // m.js, loaded as a classic script before this one

// Medals persist per question, keyed by page and id. Storage can throw
// outright (private windows, blocked site data), so every touch is guarded and
// a page with no storage simply never remembers.
const KEY = 'bgtutor:solved';
const solved = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
})();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(solved)); } catch {} };

const MS = 280;   // how long a checker takes to reach its point

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
    if (!el || !from) return;
    if (globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const num = a => +el.getAttribute(a);
    const cx = el.tagName === 'circle' ? num('cx') : num('x') + num('width') / 2;
    const cy = el.tagName === 'circle' ? num('cy') : num('y') + num('height') / 2;
    const dx = from.x - cx, dy = from.y - cy;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    const lift = (from.y > GEO.MID ? -1 : 1) * Math.min(6, d * 0.18);

    // The SVG `transform` attribute driven by rAF, not a CSS transform driven
    // by Web Animations. Animating CSS transforms on SVG *elements* is exactly
    // where mobile browsers part company with desktop ones; the attribute has
    // meant the same thing everywhere since SVG 1.1. A later redraw detaches
    // this element, and writing to a detached node is harmless, so the loop
    // needs no cancelling.
    const t0 = performance.now();
    const frame = now => {
      const raw = Math.min(1, (now - t0) / MS);
      const t = 1 - (1 - raw) * (1 - raw);                    // ease out
      const x = dx * (1 - t), y = dy * (1 - t) + lift * 4 * t * (1 - t);
      el.setAttribute('transform', `translate(${x} ${y})`);
      if (raw < 1) requestAnimationFrame(frame);
      else el.removeAttribute('transform');
    };
    requestAnimationFrame(frame);
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

  /**
   * Goals are listed in order of importance, and that order decides the
   * feedback. Meet them all and every `why` is printed, in order. Fail and
   * only the first failure speaks -- naming the biggest miss and then piling
   * on the smaller ones is not how a teacher talks, and the student has
   * already been told the answer is wrong.
   */
  judge(move) {
    const decided = decide(this.q.goals, this.q.pos, this.pos, this.side);

    // CLAUDE.md: a legal play with nothing to judge it against is not
    // something to guess at.
    if (!decided.length) {
      console.warn('unanalysed play', this.q.id, move);
      return { tone: 'unknown', html: '<p>This play has not been analysed yet.</p>' };
    }

    const failed = decided.find(g => !g.met);
    if (!failed) return {
      tone: 'good',
      html: decided.map(g => g.why).filter(Boolean).join('') || '<p>That is the play.</p>',
    };

    // The reason first, then anything the page has to say about this exact
    // play. General before specific, and never one without the other.
    const trap = (this.q.traps || {})[move];
    const html = [
      failed.otherwise || this.q.otherwise || missed(failed, this.pos, this.side),
      trap,
    ].filter(Boolean).join('');
    return { tone: 'bad', html };
  }
}

for (const s of document.querySelectorAll('.screen-question[data-q]')) new Play(s);
