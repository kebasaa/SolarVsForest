<script lang="ts">
  import type { Snippet } from 'svelte';
  import { reveal } from '../util/reveal';

  interface Props {
    index: string;
    kicker: string;
    /** heading; a final "." is added unless it ends in punctuation */
    title: string;
    children?: Snippet;
  }
  let { index, kicker, title, children }: Props = $props();
</script>

<header class="sh" use:reveal>
  <div class="label meta"><span class="idx">{index}</span> · {kicker}</div>
  <h2 class="display title">{title}{#if !/[.?!]$/.test(title)}<span class="dot">.</span>{/if}</h2>
  {#if children}
    <div class="lead">{@render children()}</div>
  {/if}
</header>

<style>
  .sh {
    margin-bottom: clamp(28px, 4vw, 56px);
  }
  .meta {
    margin-bottom: 14px;
  }
  .idx {
    color: var(--lime);
  }
  .title {
    font-size: var(--step-3);
    line-height: 1.12;
    max-width: 22ch;
  }
  .dot {
    color: var(--lime);
  }
  .lead {
    margin-top: 20px;
    font-size: var(--step-1);
    line-height: 1.5;
  }
  .lead :global(p) {
    color: var(--text-dim);
    max-width: 60ch;
  }
</style>
