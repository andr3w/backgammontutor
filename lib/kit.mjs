// Authoring kit. Pages are pure JS modules: code in, data out.
import { slugOf } from './glossary.mjs';
// $m has two backends; this is the server one, returning an inspectable tree.

export function $m(nstag, ...args) {
  // `s:circle` is m.js's SVG namespace prefix. Serialising into HTML needs no
  // namespace -- the parser puts anything inside <svg> in the right one -- so
  // the prefix is simply dropped here.
  let [tag, text] = nstag.replace(/^[a-z]+:/, '').split(/ (.*)/);
  let rest;
  [tag, ...rest] = tag.split(/(?=[.#])/g);
  const node = { tag, attrs: {}, kids: text ? [text] : [] };
  const id = rest.filter(i => i.startsWith('#')).map(i => i.slice(1)).join('');
  if (id) node.attrs.id = id;
  const cls = rest.filter(c => c.startsWith('.')).map(c => c.slice(1));
  if (cls.length) node.attrs.class = cls.join(' ');
  for (const a of args) {
    if (a == null || a === false) continue;
    else if (typeof a === 'string') node.kids.push(a);
    else if (Array.isArray(a)) node.kids.push(...a.filter(Boolean));
    else if (a.tag) node.kids.push(a);
    else Object.assign(node.attrs, a);
  }
  return node;
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const html = n => typeof n === 'string' ? esc(n)
  : `<${n.tag}${Object.entries(n.attrs).map(([k, v]) => ` ${k}="${esc(v)}"`).join('')}>`
  + n.kids.map(html).join('') + `</${n.tag}>`;

// Inline markup: **bold**, and [[glossary term]] -- optionally [[term|as
// written here]] when the sentence needs a different word from the headword.
// Nothing else. Anything more and the answer is a nested $m call, not a bigger
// parser.
//
// The link carries a real href to the glossary page, so it works with no
// JavaScript and a crawler can follow it; gloss.mjs intercepts the click and
// opens the pane instead.
const RE = /\*\*(.+?)\*\*|\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/gs;

export function inline(text) {
  const out = [];
  let last = 0, m;
  RE.lastIndex = 0;
  while ((m = RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push($m('strong', m[1]));
    else {
      const term = m[2].trim();
      out.push($m('a.gloss', {
        'data-term': term.toLowerCase(),
        href: `/glossary#${slugOf(term)}`,
      }, (m[3] || term).trim()));
    }
    last = RE.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.filter(x => x !== '');
}

/** Every glossary term a piece of text links to. */
export function linkedTerms(text) {
  const found = [];
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(text))) if (m[2]) found.push(m[2].trim().toLowerCase());
  return found;
}

export const prose = (strs, ...vals) =>
  $m('p', inline(strs.reduce((a, s, i) => a + s + (vals[i] ?? ''), '').trim()));

// --- goals ---------------------------------------------------------------
//
// Two kinds, and the spelling says which. A *state* goal reads as an adjective
// and describes the board when the play is over. An *event* goal reads as a
// verb and describes what the play did, which is not always recoverable from
// where the checkers ended up -- the position after 8/4* is the position you
// would also reach by occupying the 4 point with his checker already on the
// bar, so hitting has to be asked about as an event.
//
// Each goal carries both halves of its rationale: `why` when the student meets
// it, `otherwise` when they do not. List goals in order of importance --
// meeting them all prints every `why`, and failing prints the `otherwise` of
// the first one that failed, so the most important miss is the one that gets
// named. Either half may be omitted; the grader writes a plain sentence.
const goal = (kind, arg, why, otherwise) => ({ kind, arg, why, otherwise });

// The same constructors serve as *antigoals*, which name what the student was
// tempted to do instead. In an antigoal `why` is what to say when they did it,
// and `otherwise` is never shown -- there is nothing to say to someone who
// resisted a temptation except that their answer was wrong, which the failed
// goal says already.
//
// An antigoal beats a trap keyed to notation: made(7) catches every way of
// making the 7 point, however the play is spelt and however the rest of the
// roll goes, and it cannot be mistyped into silence.

// state: two or more of yours on the point at the end. True whether you made
// it this roll or held it all along -- the student is graded on the board they
// leave behind, not on which checkers moved.
export const made    = (point, why, otherwise) => goal('made', point, why, otherwise);
// state: exactly one of yours on the point -- a blot, neither made nor clear.
export const blot    = (point, why, otherwise) => goal('blot', point, why, otherwise);
// state: none of yours left on the point. Note this is not the negation of
// made: a point with one checker on it is neither made nor clear, and that is
// the condition worth telling a student about.
export const clear   = (point, why, otherwise) => goal('clear', point, why, otherwise);
// state: consecutive points held, at least this many in a row.
export const prime   = (n, why, otherwise)     => goal('prime', n, why, otherwise);
// state: points made in your own home board, at least this many.
export const board   = (n, why, otherwise)     => goal('board', n, why, otherwise);
// state: how many of your blots he can reach with a single die.
export const shots   = (n, why, otherwise)     => goal('shots', n, why, otherwise);

// event: his blot on this point goes to the bar.
export const hits    = (point, why, otherwise) => goal('hits', point, why, otherwise);
// event: a checker of yours leaves this point, deep in his territory.
export const escapes = (from, why, otherwise)  => goal('escapes', from, why, otherwise);

export function question(spec) {
  const node = $m('div.question', { id: spec.id },
    $m('div.board'),
    $m('div.dice', spec.dice.join('-')),
    spec.ask);
  node.meta = spec;
  return node;
}

const collect = n => typeof n === 'string' ? []
  : [...(n.meta ? [n.meta] : []), ...n.kids.flatMap(collect)];

/**
 * page(title, kids, { next })
 *
 * `next` recommends where to go at the end: a slug, or several. The ending
 * names each one by its own title, so a recommendation never goes stale when a
 * page is renamed. Omit it and the ending offers the list of pages.
 */
export function page(title, kids, opts = {}) {
  const tree = $m('main', $m('h1', title), kids);
  const next = opts.next ? [opts.next].flat() : [];
  return { title, tree, questions: collect(tree), next };
}
