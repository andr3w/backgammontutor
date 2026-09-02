// Vertical pager navigation.
//
//   swipe the BOARD up/down  -> previous/next question
//   swipe the DISCUSSION     -> scrolls the discussion; the board stays put
//
// The discussion staying put is not done here: it falls out of
// `overscroll-behavior: contain` in the CSS, which stops a discussion scroll
// from chaining out to the pager. This file only handles the board's gestures,
// which are free because the board sets `touch-action: none`.

(() => {
  const pager = document.querySelector('.pager');
  if (!pager) return;
  const screens = [...pager.querySelectorAll('.screen')];
  if (screens.length < 2) return;

  const TAP = 10;        // px of travel still counted as a tap, not a swipe
  const SWIPE = 40;      // px of vertical travel that commits to navigating
  const TIME = 800;      // ms after which a drag is no longer a swipe

  const current = () => {
    const y = pager.scrollTop, h = pager.clientHeight;
    let best = 0, dist = Infinity;
    screens.forEach((s, i) => {
      const d = Math.abs(s.offsetTop - y);
      if (d < dist) { dist = d; best = i; }
    });
    return best;
  };

  let animating = false;
  const go = i => {
    i = Math.max(0, Math.min(screens.length - 1, i));
    if (i === current() || animating) return;
    animating = true;
    screens[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { animating = false; }, 450);
  };
  const step = d => go(current() + d);

  // --- board gestures -------------------------------------------------
  for (const board of pager.querySelectorAll('.board-area')) {
    let x0 = 0, y0 = 0, t0 = 0, id = null;

    board.addEventListener('pointerdown', e => {
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; t0 = e.timeStamp;
    });

    const end = e => {
      if (e.pointerId !== id) return;
      id = null;
      const dx = e.clientX - x0, dy = e.clientY - y0, dt = e.timeStamp - t0;
      if (Math.hypot(dx, dy) <= TAP) return;               // a tap: leave it to click
      if (dt > TIME) return;                               // too slow to be a swipe
      if (Math.abs(dy) < SWIPE || Math.abs(dy) < Math.abs(dx) * 1.2) return;
      step(dy < 0 ? 1 : -1);                               // swipe up -> next
    };
    board.addEventListener('pointerup', end);
    board.addEventListener('pointercancel', () => { id = null; });

    // desktop: the wheel over a board pages rather than scrolling nothing
    let wheelLock = 0;
    board.addEventListener('wheel', e => {
      e.preventDefault();
      if (e.timeStamp - wheelLock < 500 || Math.abs(e.deltaY) < 4) return;
      wheelLock = e.timeStamp;
      step(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }

  // --- keyboard -------------------------------------------------------
  addEventListener('keydown', e => {
    // a focused nav button already answers Space and Enter itself
    if (e.target.closest && e.target.closest('button')) return;
    const k = e.key;
    if (k === 'PageDown' || k === ' ') { step(1); e.preventDefault(); }
    else if (k === 'PageUp') { step(-1); e.preventDefault(); }
    else if (k === 'Home') { go(0); e.preventDefault(); }
    else if (k === 'End') { go(screens.length - 1); e.preventDefault(); }
  });

  // --- position readout, with prev/next always in view -------------------
  // The buttons are not a convenience: a text screen has no board to swipe,
  // and a discussion that fills its screen swallows the gesture, so without
  // them a touch user can be left with no way off a screen at all.
  const bar = document.createElement('nav');
  bar.className = 'progress';
  bar.setAttribute('aria-label', 'Question navigation');

  const button = (label, glyph, d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = glyph;
    b.setAttribute('aria-label', label);
    b.addEventListener('click', () => step(d));
    return b;
  };
  const prev = button('Previous', '\u2191', -1);
  const next = button('Next', '\u2193', 1);

  const dots = document.createElement('div');
  dots.className = 'dots';
  dots.setAttribute('aria-hidden', 'true');
  screens.forEach(() => dots.appendChild(document.createElement('i')));

  bar.append(prev, dots, next);
  document.body.appendChild(bar);

  const paint = () => {
    const c = current();
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === c));
    prev.disabled = c === 0;
    next.disabled = c === screens.length - 1;
  };
  pager.addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true });
  paint();
})();
