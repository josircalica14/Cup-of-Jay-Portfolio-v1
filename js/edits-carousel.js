// Edits Gallery — V4 "Contact Sheet": stacked photo deck of featured edits.
// Prints keep their own shape — portrait (3:4) and landscape (16:10) slides share
// the stage height; the active shot sits flat while neighbors tilt underneath.
// Adapts to any number of slides — add another .edits-gallery__slide figure and it
// joins the deck.

export function setupEditsCarousel() {
  const root = document.querySelector('[data-edits-carousel]');
  if (!root) return; // Exit if the gallery is not on this page

  const slides = Array.from(root.querySelectorAll('.edits-gallery__slide'));
  const n = slides.length;
  if (!n) return;
  let index = 0;

  // Dots — one per slide
  const dotsWrap = root.querySelector('.edits-gallery__dots');
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'edits-gallery__dot';
    dot.setAttribute('aria-label', `Go to edit ${i + 1}`);
    const fill = document.createElement('span');
    fill.className = 'fill';
    dot.appendChild(fill);
    dot.addEventListener('click', () => { index = i; render(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render() {
    slides.forEach((slide, i) => {
      slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-far', 'is-far-side');
      const fwd = ((i - index) % n + n) % n;  // steps forward from the active slide
      const back = ((index - i) % n + n) % n; // steps backward
      if (fwd === 0) slide.classList.add('is-active');
      else if (back === 1) slide.classList.add('is-prev');
      else if (fwd === 1) slide.classList.add('is-next');
      else {
        slide.classList.add('is-far');
        if (back < fwd) slide.classList.add('is-far-side');
      }
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  root.querySelector('[data-prev]').addEventListener('click', () => {
    index = (index - 1 + n) % n;
    render();
  });

  root.querySelector('[data-next]').addEventListener('click', () => {
    index = (index + 1) % n;
    render();
  });

  // ── Mobile stage sync ──
  // On ≤768px the track has a fixed CSS height (sized to the tallest shape), so
  // this only needs to clear any inline height left over from a desktop render —
  // no per-slide measuring, no height jumps between portrait and landscape edits.
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  function syncMobileHeight() {
    const track = root.querySelector('.edits-gallery__track');
    if (mobileQuery.matches) track.style.height = '';
  }
  window.addEventListener('resize', () => requestAnimationFrame(syncMobileHeight));
  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', () => requestAnimationFrame(syncMobileHeight));

  // ── Autoplay — same pattern as the Featured Projects spotlight ──
  // The active pill's fill IS the clock: it animates over --edits-interval and
  // when it finishes (animationend) the deck advances. Pausing just freezes the
  // CSS animation mid-fill, so the pill and the actual slide can never drift.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function startAutoplay() {
    if (reducedMotion) return;
    root.classList.remove('edits-gallery--paused');
  }

  function stopAutoplay() {
    root.classList.add('edits-gallery--paused');
  }

  // Advance when the active pill finishes filling.
  dotsWrap.addEventListener('animationend', (e) => {
    if (e.animationName === 'editsDotFill') {
      index = (index + 1) % n;
      render();
    }
  });

  const baseRender = render;
  render = function () { baseRender(); syncMobileHeight(); };

  // Hovering (or touching) a photo takes manual control — resume when the cursor
  // leaves the prints themselves, not the whole section (dots/arrows/gaps stay live).
  slides.forEach((slide) => {
    slide.addEventListener('pointerenter', stopAutoplay);
    slide.addEventListener('pointerleave', startAutoplay);
  });

  // ── Hover tilt (H2) ──
  // Feed the cursor position into the CSS custom properties that drive the lift &
  // pointer-tilt hover animation (see edits.css). --ry/--rx rotate the print toward
  // the cursor; --gx/--gy park the glare sheen under it. Values reset on leave so
  // the next hover starts from a level print. Hover-only pointers skip this.
  if (window.matchMedia('(hover: hover)').matches) {
    const TILT_MAX = 5;   // deg — gentle enough to keep the deck readable
    slides.forEach((slide) => {
      // .is-hover mirrors :hover so the effect also engages in engines whose
      // :hover never computes from synthesized input; identical for real users.
      slide.addEventListener('pointerenter', () => slide.classList.add('is-hover'));
      slide.addEventListener('pointerleave', () => slide.classList.remove('is-hover'));
      slide.addEventListener('pointermove', (e) => {
        const r = slide.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        slide.style.setProperty('--ry', ((px - 0.5) * TILT_MAX).toFixed(2) + 'deg');
        slide.style.setProperty('--rx', ((0.5 - py) * TILT_MAX * 0.8).toFixed(2) + 'deg');
        slide.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        slide.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      slide.addEventListener('pointerleave', () => {
        ['--rx', '--ry', '--gx', '--gy'].forEach(p => slide.style.removeProperty(p));
      });
    });
  }

  // Freeze when the tab is hidden; resume when it's back.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Only run while the section is actually on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAutoplay();
      else stopAutoplay();
    }, { threshold: 0.25 }).observe(root);
  } else {
    startAutoplay();
  }

  render();
}
