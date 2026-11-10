<script lang="ts" module>
  export interface LandItem {
    label: string;
    value: number;
    /** optional lower bound drawn as a dashed inner square */
    low?: number;
    color: string;
    caption?: string;
    dashed?: boolean;
  }
</script>

<script lang="ts">
  /** Proportional-area squares (side ∝ √area), anchored bottom-left, largest drawn first. */
  import { fmt } from '../util/format';

  interface Props {
    items: LandItem[];
    /** reference area that maps to the full box (Mkm²) */
    ref: number;
    refLabel: string;
  }
  let { items, ref, refLabel }: Props = $props();

  const S = 500;
  const dec = (v: number) => (v < 1 ? 2 : Number.isInteger(v) ? 0 : 1);
  const box = $derived(Math.max(ref, ...items.map((i) => i.value)) * 1.04);
  const side = (a: number) => S * Math.sqrt(a / box);
  const rs = $derived(side(ref));
  const sorted = $derived([...items].sort((a, b) => b.value - a.value));
</script>

<div class="ls">
  <svg viewBox="-1 -1 {S + 2} {S + 2}" role="img" aria-label="{refLabel}: {ref} million km². {items.map((i) => `${i.label}: ${i.low ? `${i.low}–` : ''}${i.value} million km²`).join('; ')}.">
    <rect x="0" y={S - rs} width={rs} height={rs} class="refbox" />
    <text x="8" y={S - rs + 16} class="reft">{refLabel.toUpperCase()} · {ref} Mkm²</text>
    {#each sorted as it (it.label)}
      {@const s = side(it.value)}
      <rect
        x="0"
        y={S - s}
        width={s}
        height={s}
        fill={it.color}
        fill-opacity={it.dashed ? 0.04 : 0.16}
        stroke={it.color}
        stroke-width="1.5"
        stroke-dasharray={it.dashed ? '5 4' : undefined}
        class="sq"
      />
      {#if it.low}
        {@const sl = side(it.low)}
        <rect x="0" y={S - sl} width={sl} height={sl} fill="none" stroke={it.color} stroke-dasharray="3 3" stroke-opacity="0.8" />
      {/if}
    {/each}
  </svg>
  <ul class="legend">
    {#each items as it}
      <li style:--c={it.color}>
        <span class="sw" class:dashed={it.dashed}></span>
        <span class="lab">{it.label}</span>
        <span class="num v">{it.low ? `${fmt(it.low, dec(it.low))}–` : ''}{fmt(it.value, dec(it.value))}<span class="unit">Mkm²</span></span>
        {#if it.caption}<span class="cap">{it.caption}</span>{/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .ls {
    display: grid;
    gap: 14px;
  }
  svg {
    width: 100%;
    max-width: 520px;
    height: auto;
  }
  .refbox {
    fill: rgba(170, 255, 210, 0.02);
    stroke: var(--line-strong);
    stroke-dasharray: 2 4;
  }
  .reft {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    fill: var(--text-faint);
  }
  .sq {
    transition: width 0.6s var(--ease-out), height 0.6s var(--ease-out), y 0.6s var(--ease-out);
  }
  .legend {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .legend li {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    gap: 2px 10px;
    align-items: baseline;
  }
  .sw {
    width: 12px;
    height: 12px;
    background: color-mix(in srgb, var(--c) 25%, transparent);
    border: 1.5px solid var(--c);
    align-self: center;
  }
  .sw.dashed {
    border-style: dashed;
    background: transparent;
  }
  .lab {
    font-size: var(--step--1);
    color: var(--text-dim);
  }
  .v {
    color: var(--c);
    font-size: var(--step--1);
    white-space: nowrap;
  }
  .cap {
    grid-column: 2 / -1;
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--text-faint);
  }
</style>
