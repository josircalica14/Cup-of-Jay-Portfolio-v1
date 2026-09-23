// Before/after compare — drag (or arrow-key) the divider to wipe between the
// raw and edited frames. The .ba element carries --pos (0–100%); CSS clips the
// "before" image from the left and places the divider/handle there. Works with
// mouse, touch (pointer capture), and keyboard via the slider role.

export function setupBeforeAfter() {
  const plates = document.querySelectorAll('.ba');
  if (!plates.length) return; // Not on a page with compare plates

  plates.forEach((plate) => {
    const setPos = (pct) => {
      const pos = Math.min(100, Math.max(0, pct));
      plate.style.setProperty('--pos', pos + '%');
      plate.setAttribute('aria-valuenow', String(Math.round(pos)));
    };

    const fromEvent = (e) => {
      const r = plate.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };

    plate.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      // Capture keeps the drag alive when the cursor leaves the plate. Some
      // environments hand us pointer ids that can't be captured — the drag
      // still works without it, so never let this abort the handler.
      try { plate.setPointerCapture(e.pointerId); } catch (_) {}
      fromEvent(e);
      const move = (ev) => fromEvent(ev);
      const up = () => {
        plate.removeEventListener('pointermove', move);
        plate.removeEventListener('pointerup', up);
        plate.removeEventListener('pointercancel', up);
      };
      plate.addEventListener('pointermove', move);
      plate.addEventListener('pointerup', up);
      plate.addEventListener('pointercancel', up);
    });

    // Keyboard: arrows nudge the divider 4%, Home/End jump to the edges.
    plate.addEventListener('keydown', (e) => {
      const current = parseFloat(plate.style.getPropertyValue('--pos')) || 50;
      const step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(current - step); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setPos(current + step); }
      else if (e.key === 'Home') { e.preventDefault(); setPos(0); }
      else if (e.key === 'End') { e.preventDefault(); setPos(100); }
    });
  });
}
