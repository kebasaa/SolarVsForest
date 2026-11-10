/** Svelte action: add `.in` once the element scrolls into view. */
export function reveal(node: HTMLElement, opts: { delay?: number } = {}) {
  node.classList.add('reveal');
  if (opts.delay) node.style.transitionDelay = `${opts.delay}ms`;
  if (typeof IntersectionObserver === 'undefined') {
    node.classList.add('in');
    return {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          node.classList.add('in');
          io.disconnect();
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );
  io.observe(node);
  return { destroy: () => io.disconnect() };
}

/** Svelte action: call `cb(true)` when the element is visible (once). */
export function onVisible(node: HTMLElement, cb: () => void) {
  if (typeof IntersectionObserver === 'undefined') {
    cb();
    return {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        cb();
        io.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  io.observe(node);
  return { destroy: () => io.disconnect() };
}

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
