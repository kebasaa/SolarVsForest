<script lang="ts">
  import { onVisible, prefersReducedMotion } from '../util/reveal';
  import { fmt } from '../util/format';

  interface Props {
    to: number;
    decimals?: number;
    duration?: number;
    prefix?: string;
  }
  let { to, decimals = 0, duration = 1400, prefix = '' }: Props = $props();
  let shown = $state(0);
  let started = false;

  function start() {
    if (started) return;
    started = true;
    if (prefersReducedMotion()) {
      shown = to;
      return;
    }
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      shown = to * e;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
</script>

<span use:onVisible={start} aria-label="{prefix}{fmt(to, decimals)}"><span aria-hidden="true">{prefix}{fmt(shown, decimals)}</span></span>
