// The glossary pane.
//
// A tapped term opens the whole list scrolled to that entry, rather than a
// single definition in a bubble. That is deliberate: the neighbouring words
// are the ones a student has not met yet, and landing among them is how they
// get met. Every definition links on to others for the same reason.
//
// The links work without any of this -- they carry a real href to /glossary --
// so this only upgrades a page load into a pane.

const pane = document.querySelector('.gloss-pane');
const list = document.querySelector('.gloss-body');

function reveal(term) {
  const el = list && list.querySelector(`[id="${CSS.escape(term)}"]`);
  if (!el) return false;
  for (const p of list.querySelectorAll('.here')) p.classList.remove('here');
  el.classList.add('here');
  const dd = el.nextElementSibling;
  if (dd) dd.classList.add('here');
  // instant, not smooth: the pane has only just appeared, so there is no
  // journey for the eye to follow, and a scroll animation just delays reading
  el.scrollIntoView({ block: 'center' });
  return true;
}

const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function open(term) {
  if (!pane) return false;
  pane.hidden = false;
  document.body.classList.add('gloss-open');
  if (!reveal(slug(term))) list.scrollTop = 0;
  return true;
}

function close() {
  if (!pane) return;
  pane.hidden = true;
  document.body.classList.remove('gloss-open');
}

addEventListener('click', e => {
  const link = e.target.closest && e.target.closest('a.gloss');
  if (link) {
    // no pane on the glossary page itself: let the anchor do its work
    if (pane && open(link.dataset.term || link.textContent)) e.preventDefault();
    return;
  }
  if (e.target.closest && e.target.closest('.gloss-close')) close();
});

addEventListener('keydown', e => {
  if (e.key === 'Escape' && pane && !pane.hidden) { close(); e.preventDefault(); }
});

// On the standalone page, mark whatever the URL asked for.
if (!pane && location.hash) reveal(decodeURIComponent(location.hash.slice(1)));
