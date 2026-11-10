<script lang="ts" module>
  // KaTeX (+ its CSS and fonts) is loaded on first use, keeping it out of the initial bundle
  let katexPromise: Promise<typeof import('katex').default> | null = null;
  function loadKatex() {
    katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([m]) => m.default);
    return katexPromise;
  }
</script>

<script lang="ts">
  interface Props {
    tex: string;
    display?: boolean;
    label?: string;
  }
  let { tex, display = true, label }: Props = $props();
  let html = $state('');

  $effect(() => {
    const t = tex;
    const d = display;
    let alive = true;
    loadKatex().then((katex) => {
      if (alive) html = katex.renderToString(t, { displayMode: d, throwOnError: false, output: 'htmlAndMathml' });
    });
    return () => {
      alive = false;
    };
  });
</script>

<div class="eq" class:inline={!display}>
  {#if html}
    {@html html}
  {:else}
    <code class="raw">{tex}</code>
  {/if}
  {#if label}<span class="tag label">{label}</span>{/if}
</div>

<style>
  .eq {
    position: relative;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 2px 0;
    color: var(--text);
    min-height: 2.4em;
  }
  .eq.inline {
    display: inline-block;
  }
  .raw {
    font-family: var(--font-mono);
    font-size: var(--step--1);
    color: var(--text-dim);
  }
  .tag {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  .eq :global(.katex) {
    font-size: 1.12em;
  }
</style>
