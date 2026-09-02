// Authoring kit. Pages are pure JS modules: code in, data out.
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

// **bold** is the only markup prose takes. Anything more and the answer is a
// nested $m call, not a bigger parser.
const bold = t => t.split(/\*\*(.+?)\*\*/s).map((s, i) => i % 2 ? $m('strong', s) : s).filter(Boolean);
export const prose = (strs, ...vals) =>
  $m('p', bold(strs.reduce((a, s, i) => a + s + (vals[i] ?? ''), '').trim()));

// --- goals: structural predicates over (position, move) ---
//
// Each carries both halves of its rationale: `why` when the student meets it,
// `otherwise` when they do not. List goals in order of importance -- meeting
// them all prints every `why`, and failing prints the `otherwise` of the first
// one that failed, so the most important miss is the one that gets named.
// Either half may be omitted; the grader generates a plain sentence instead.
const goal = (kind, arg, why, otherwise) => ({ kind, arg, why, otherwise });
export const makes   = (point, why, otherwise) => goal('makes', point, why, otherwise);
export const shots   = (n, why, otherwise)     => goal('shots', n, why, otherwise);
export const escapes = (from, why, otherwise)  => goal('escapes', from, why, otherwise);
// keeps: still holding the point at the end -- for rolls that offer to build
// one point by pulling another one apart.
export const keeps   = (point, why, otherwise) => goal('keeps', point, why, otherwise);
// hits: his blot on this point goes to the bar.
export const hits    = (point, why, otherwise) => goal('hits', point, why, otherwise);

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
