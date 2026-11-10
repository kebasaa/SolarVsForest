<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    value: string;
    unit?: string;
    caption?: string;
    accent?: 'lime' | 'amber' | 'cyan' | 'coral' | 'pine' | 'sand' | 'violet';
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
  }
  let { label, value, unit = '', caption = '', accent = 'lime', size = 'md', children }: Props = $props();
</script>

<div class="tile panel ticks {size}" style:--acc="var(--{accent})">
  <div class="label">{label}</div>
  <div class="val num"><span class="v">{value}</span>{#if unit}<span class="unit">{unit}</span>{/if}</div>
  {#if caption}<div class="cap">{caption}</div>{/if}
  {#if children}{@render children()}{/if}
</div>

<style>
  .tile {
    padding: 14px 16px 14px;
    border-top: 2px solid var(--acc);
    min-width: 0;
  }
  .val {
    margin-top: 6px;
    font-size: var(--step-2);
    line-height: 1.1;
    color: var(--acc);
    text-shadow: 0 0 22px color-mix(in srgb, var(--acc) 35%, transparent);
    white-space: nowrap;
  }
  .sm .val {
    font-size: var(--step-1);
  }
  .lg .val {
    font-size: var(--step-3);
  }
  .cap {
    margin-top: 6px;
    font-size: var(--step--1);
    color: var(--text-dim);
    line-height: 1.4;
  }
</style>
