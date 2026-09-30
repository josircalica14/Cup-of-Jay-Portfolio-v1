// Scroll-reveal — staggered entrance for content blocks on every page.
// Add `data-reveal` to any element; optionally `data-reveal-delay="1..5"`
// for a per-element stagger step. Elements start hidden via CSS only when
// `html.p44-js` is present (JS available), so nothing ever gets stuck
// invisible without JS.

const STEP_MS = 80;

export function setupScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return; // Not on this page

  const reveal = (el) => el.classList.add('is-revealed');

  // Reduced motion: everything shows immediately, no choreography.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(reveal);
    return;
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach(reveal);
    return;
  }

  // Already on screen at load? Reveal immediately, no observer needed.
  const revealVisible = () => {
    targets.forEach((el) => {
      if (el.classList.contains('is-revealed')) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        const step = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(() => reveal(el), step * STEP_MS);
      }
    });
  };
  revealVisible();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const step = parseInt(el.dataset.revealDelay || '0', 10);
      setTimeout(() => reveal(el), step * STEP_MS);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => io.observe(el));

  // Safety net (same as socials.js): some webviews defer/drop IO callbacks
  // while hidden or capture screenshots. Scroll listeners + a timed settle
  // guarantee content never stays hidden.
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      revealVisible();
      scrollTick = false;
    });
  }, { passive: true });

  setTimeout(() => targets.forEach(reveal), 4000);
}
