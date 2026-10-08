// Web pets — one spriteBase() adapter resolves the deploy path once,
// and a declarative SPAWN list replaces the copy-pasted per-section blocks.
// Adding a pet is one entry: { animal, color, container, scale, message }.

import { WebPet } from '../webpet/web-pet.js';

// One adapter for the "where do sprites live" decision (local vs GitHub Pages).
function spriteBase() {
  const isLive = window.location.hostname === 'josircalica14.github.io';
  return isLive
    ? '/Cup-of-Jay-Portfolio-Project/webpet/sprites'
    : './webpet/sprites';
}

const SPAWN = [
  {
    section: '.hero-section',
    position: 'absolute',
    pets: [
      { animal: 'totoro', color: 'gray', scale: 0.4, message: 'Hi there!' },
      { animal: 'dog', color: 'akita', scale: 0.4, message: 'Arf arf!' },
    ],
  },
  {
    // The rex is fixed to the viewport and would be clipped by the about
    // section's overflow:hidden — so it attaches to <body> like the original.
    section: '.about-section',
    attachTo: 'body',
    position: 'fixed',
    pets: [
      { animal: 'rex', color: 'dino_rex', scale: 0.24, message: 'Rwar!' },
    ],
  },
];

export function setupPets() {
  const base = spriteBase();

  // Small screens: shrink pets a bit more so they don't crowd the hero.
  // Evaluated at spawn time (page load), matching how the site is used.
  const smallScreen = window.matchMedia('(max-width: 500px)');
  const screenScale = (scale) => (smallScreen.matches ? scale * 0.8 : scale);

  for (const { section, attachTo, position, pets } of SPAWN) {
    const gate = document.querySelector(section);
    if (!gate) continue; // Section not on this page
    const container = attachTo === 'body' ? document.body : gate;
    if (gate !== container) gate.style.position = 'relative';

    for (const pet of pets) {
      new WebPet({ ...pet, scale: screenScale(pet.scale), container, base, position });
    }
  }
}
