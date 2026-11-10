<script lang="ts">
  import Picture from './Picture.svelte';

  interface Props {
    left: { id: string; label: string; value: string };
    right: { id: string; label: string; value: string };
    aspect?: string;
  }
  let { left, right, aspect = '4 / 3' }: Props = $props();
  let pos = $state(50);
</script>

<div class="cmp" style:aspect-ratio={aspect}>
  <div class="layer">
    <Picture id={right.id} cover sizes="(max-width: 900px) 100vw, 680px" />
  </div>
  <div class="layer" style:clip-path="inset(0 {100 - pos}% 0 0)">
    <Picture id={left.id} cover sizes="(max-width: 900px) 100vw, 680px" />
  </div>
  <div class="handle" style:left="{pos}%" aria-hidden="true">
    <div class="knob">⟨ ⟩</div>
  </div>
  <div class="tag l panel" style:opacity={pos > 18 ? 1 : 0}>
    <span class="label">{left.label}</span><span class="num c-lime">{left.value}</span>
  </div>
  <div class="tag r panel" style:opacity={pos < 82 ? 1 : 0}>
    <span class="label">{right.label}</span><span class="num c-pine">{right.value}</span>
  </div>
  <input
    type="range"
    min="0"
    max="100"
    step="0.5"
    bind:value={pos}
    aria-label="Compare {left.label} and {right.label}"
  />
</div>

<style>
  .cmp {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--bg-2);
    user-select: none;
    touch-action: pan-y;
  }
  .layer {
    position: absolute;
    inset: 0;
  }
  .handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    margin-left: -1px;
    background: var(--lime);
    box-shadow: var(--glow-lime);
    pointer-events: none;
  }
  .knob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 6px 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--lime);
    background: rgba(5, 14, 11, 0.85);
    border: 1px solid var(--lime);
    border-radius: 2px;
    white-space: nowrap;
  }
  .tag {
    position: absolute;
    top: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 10px;
    background: rgba(5, 14, 11, 0.78);
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .tag .num {
    font-size: var(--step-1);
  }
  .tag.l {
    left: 12px;
  }
  .tag.r {
    right: 12px;
    text-align: right;
  }
  input[type='range'] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: ew-resize;
  }
  .cmp:has(input:focus-visible) {
    outline: 2px solid var(--lime);
    outline-offset: 3px;
  }
</style>
