<script lang="ts" module>
  export interface Callout {
    /** anchor on the photo, as fractions of the image (0–1) */
    x: number;
    y: number;
    /** panel position as fractions of the frame (0–1); panel grows away from the anchor */
    px: number;
    py: number;
    side: 'left' | 'right';
    label: string;
    value: string;
    unit?: string;
    caption?: string;
    accent?: 'lime' | 'amber' | 'cyan' | 'coral' | 'pine' | 'sand' | 'violet';
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import Picture from './Picture.svelte';
  import { PHOTOS } from '../data/photos';

  interface Props {
    id: string;
    callouts: Callout[];
    /** CSS height of the frame */
    height?: string;
    focus?: string;
    eager?: boolean;
    sizes?: string;
    children?: Snippet;
    /** below this frame width, panels are listed under the photo */
    compactBelow?: number;
    /** full-bleed: no border/radius */
    bare?: boolean;
    /** on narrow frames, drop the callout list instead of showing it below */
    hideCompactList?: boolean;
  }
  let {
    id,
    callouts,
    height = 'min(78vh, 760px)',
    focus,
    eager = false,
    sizes = '100vw',
    children,
    compactBelow = 760,
    bare = false,
    hideCompactList = false
  }: Props = $props();

  let cw = $state(0);
  let ch = $state(0);
  const p = $derived(PHOTOS[id]);
  const f = $derived(
    (focus ?? p.focus).split(' ').map((s) => parseFloat(s) / 100) as [number, number]
  );

  /** map image-fraction coordinates to frame pixels under object-fit: cover */
  function map(x: number, y: number): [number, number] {
    const s = Math.max(cw / p.width, ch / p.height);
    const dw = p.width * s;
    const dh = p.height * s;
    const ox = (cw - dw) * f[0];
    const oy = (ch - dh) * f[1];
    return [ox + x * dw, oy + y * dh];
  }

  const compact = $derived(cw > 0 && cw < compactBelow);
  const pts = $derived(
    callouts.map((c) => {
      const [ax, ay] = map(c.x, c.y);
      const bx = c.px * cw;
      const by = c.py * ch + 22;
      return { ax, ay, bx, by, c };
    })
  );
</script>

<figure class="hud-photo" class:compact>
  <div class="frame" class:bare style:height bind:clientWidth={cw} bind:clientHeight={ch}>
    <Picture {id} cover {eager} {sizes} focus={focus ?? p.focus} />
    <div class="shade"></div>
    {#if cw > 0}
      <svg class="leaders" width={cw} height={ch} aria-hidden="true">
        {#each pts as pt, i}
          {@const col = `var(--${pt.c.accent ?? 'lime'})`}
          {#if !compact}
            <path
              d="M{pt.ax},{pt.ay} L{pt.ax + (pt.bx - pt.ax) * 0.55},{pt.by} L{pt.bx},{pt.by}"
              fill="none"
              stroke={col}
              stroke-width="1.2"
              stroke-dasharray="4 4"
              class="lead"
            />
          {/if}
          <circle cx={pt.ax} cy={pt.ay} r="10" fill="none" stroke={col} stroke-width="1" class="ring" />
          <circle cx={pt.ax} cy={pt.ay} r="3.5" fill={col} />
          {#if compact && !hideCompactList}
            <text x={pt.ax + 14} y={pt.ay + 4} fill={col} class="mono" font-size="12">{i + 1}</text>
          {/if}
        {/each}
      </svg>
      {#if !compact}
        {#each pts as pt}
          <div
            class="callout panel ticks"
            class:left={pt.c.side === 'left'}
            style:left="{pt.bx}px"
            style:top="{pt.by - 22}px"
            style:--acc="var(--{pt.c.accent ?? 'lime'})"
          >
            <div class="label">{pt.c.label}</div>
            <div class="num v">{pt.c.value}{#if pt.c.unit}<span class="unit">{pt.c.unit}</span>{/if}</div>
            {#if pt.c.caption}<div class="cap">{pt.c.caption}</div>{/if}
          </div>
        {/each}
      {/if}
    {/if}
    {#if children}<div class="overlay">{@render children()}</div>{/if}
  </div>
  {#if compact && !hideCompactList}
    <ol class="list">
      {#each callouts as c, i}
        <li class="callout panel ticks" style:--acc="var(--{c.accent ?? 'lime'})">
          <div class="label"><span class="n">{i + 1}</span> {c.label}</div>
          <div class="num v">{c.value}{#if c.unit}<span class="unit">{c.unit}</span>{/if}</div>
          {#if c.caption}<div class="cap">{c.caption}</div>{/if}
        </li>
      {/each}
    </ol>
  {/if}
  <figcaption class="sr-only">{p.alt} Photo: {p.credit}.</figcaption>
</figure>

<style>
  .hud-photo {
    margin: 0;
    position: relative;
  }
  .frame {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
  }
  .frame.bare {
    border: 0;
    border-radius: 0;
  }
  .shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(5, 14, 11, 0.35), transparent 30%, transparent 65%, rgba(5, 14, 11, 0.55)),
      radial-gradient(ellipse at center, transparent 55%, rgba(5, 14, 11, 0.45));
    pointer-events: none;
  }
  .leaders {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }
  .lead {
    animation: flow 2.4s linear infinite;
    filter: drop-shadow(0 0 3px currentColor);
  }
  .ring {
    animation: pulse 2.2s ease-in-out infinite;
  }
  .callout {
    position: absolute;
    padding: 10px 12px;
    min-width: 150px;
    max-width: 230px;
    border-top: 2px solid var(--acc);
    background: rgba(6, 20, 16, 0.78);
  }
  .callout.left {
    transform: translateX(-100%);
  }
  .callout .v {
    font-size: var(--step-1);
    color: var(--acc);
    text-shadow: 0 0 18px color-mix(in srgb, var(--acc) 40%, transparent);
    margin-top: 4px;
    white-space: nowrap;
  }
  .callout .cap {
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--text-dim);
    margin-top: 4px;
    line-height: 1.35;
  }
  .overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .overlay :global(*) {
    pointer-events: auto;
  }
  .list {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
  .list .callout {
    position: static;
    max-width: none;
    min-width: 0;
  }
  .n {
    color: var(--acc);
  }
</style>
