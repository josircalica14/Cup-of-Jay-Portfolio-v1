// Entry point — detects which features the current page has and wires
// each feature module. All DOM feature logic lives in js/* modules.

import { initTheme } from './js/theme.js';
import { setupHeroTyper } from './js/hero-typer.js';
import { setupHeroTilt } from './js/hero-tilt.js';
import { setupSpotlight } from './js/spotlight.js';
import { setupEditsCarousel } from './js/edits-carousel.js';
import { setupPets } from './js/pets.js';
import { setupProjectTags } from './js/project-tags.js';
import { setupBeforeAfter } from './js/before-after.js';
import { setupSocials } from './js/socials.js';
import { renderNavLinks, setupNavScroll, setupNavLoadAnimation } from './js/nav.js';

initTheme();
renderNavLinks();
setupNavScroll();
setupNavLoadAnimation();

setupHeroTyper();
setupHeroTilt();
setupSpotlight();
setupEditsCarousel();

// Wait for layout, then collapse overflowing tag pills
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupProjectTags, { once: true });
} else {
  setupProjectTags();
}
setupBeforeAfter();
setupSocials();

document.addEventListener('DOMContentLoaded', setupPets);
