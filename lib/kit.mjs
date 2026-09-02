// Authoring kit. Pages are pure JS modules: code in, data out.
// $m has two backends; this is the server one, returning an inspectable tree.

export function $m(nstag, ...args) {
  let [tag, text] = nstag.split(/ (.*)/);
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

export const prose = (strs, ...vals) =>
  $m('p', strs.reduce((a, s, i) => a + s + (vals[i] ?? ''), '').trim());

// --- goals: structural predicates over (position, move), each carrying its rationale ---
const goal = (kind, arg, why) => ({ kind, arg, why });
export const makes   = (point, why) => goal('makes', point, why);
export const shots   = (n, why)     => goal('shots', n, why);
export const escapes = (from, why)  => goal('escapes', from, why);

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

export function page(title, kids) {
  const tree = $m('main', $m('h1', title), kids);
  return { title, tree, questions: collect(tree) };
}
