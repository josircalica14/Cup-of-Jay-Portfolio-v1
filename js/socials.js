// My Socials section — staggered scroll-reveal entrance.
// Tiles rise in one by one when the section scrolls into view.
// Includes a synchronous in-viewport check and a timeout fallback so the
// tiles can never stay hidden in engines where IntersectionObserver
// callbacks never deliver (some embedded webviews).

export function setupSocials() {
  const section = document.querySelector('.socials');
  if (!section) return; // Not on this page

  const tiles = section.querySelectorAll('.socials__tile');
  let done = false;

  const reveal = () => {
    if (done) return;
    done = true;
    tiles.forEach((tile, i) => {
      setTimeout(() => tile.classList.add('is-in'), i * 90);
    });
  };

  // Reduced motion: skip the choreography entirely
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tiles.forEach((tile) => tile.classList.add('is-in'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  // Already on screen at load? Reveal immediately, no observer needed.
  const box = section.getBoundingClientRect();
  if (box.top < innerHeight && box.bottom > 0) {
    reveal();
    return;
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      reveal();
      io.disconnect();
    }
  }, { threshold: 0.2 });
  io.observe(section);

  // Safety net: some webviews defer/drop IO callbacks while hidden.
  // Reveal anyway shortly after load — the section is below the fold,
  // so users simply see it settled if they scroll down late.
  setTimeout(reveal, 4000);
}
