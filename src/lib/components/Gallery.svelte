<script lang="ts">
  import Picture from './Picture.svelte';
  import { PHOTOS } from '../data/photos';

  interface Props {
    ids: string[];
    captions?: Record<string, string>;
  }
  let { ids, captions = {} }: Props = $props();

  let dialog: HTMLDialogElement;
  let current = $state(0);

  function open(i: number) {
    current = i;
    dialog.showModal();
  }
  function step(d: number) {
    current = (current + d + ids.length) % ids.length;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  }
</script>

<ul class="gal">
  {#each ids as id, i}
    {@const p = PHOTOS[id]}
    <li class:tall={p.height > p.width}>
      <button class="th" onclick={() => open(i)} aria-label="Enlarge: {p.alt}">
        <Picture {id} cover sizes="(max-width: 700px) 50vw, 300px" />
        <span class="cap label">{captions[id] ?? ''}</span>
      </button>
    </li>
  {/each}
</ul>

<dialog bind:this={dialog} class="lb" onkeydown={onKey} onclick={(e) => e.target === dialog && dialog.close()}>
  {#if ids[current]}
    {@const p = PHOTOS[ids[current]]}
    <figure>
      {#key current}
        <Picture id={ids[current]} sizes="92vw" class="lbpic" />
      {/key}
      <figcaption>
        <span>{p.alt}</span>
        <span class="label">Photo: {p.credit} · CC BY-NC 4.0 · {current + 1}/{ids.length}</span>
      </figcaption>
    </figure>
  {/if}
  <button class="nav prev btn" onclick={() => step(-1)} aria-label="Previous photo">←</button>
  <button class="nav next btn" onclick={() => step(1)} aria-label="Next photo">→</button>
  <button class="close btn" onclick={() => dialog.close()} aria-label="Close">✕</button>
</dialog>

<style>
  .gal {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-auto-rows: 160px;
    grid-auto-flow: dense;
    gap: 8px;
  }
  .gal li.tall {
    grid-row: span 2;
  }
  .th {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: zoom-in;
    background: var(--bg-2);
  }
  .th :global(img) {
    transition: transform 0.6s var(--ease-out), opacity 0.6s;
  }
  .th:hover :global(img) {
    transform: scale(1.04);
  }
  .cap {
    position: absolute;
    left: 8px;
    bottom: 8px;
    right: 8px;
    text-align: left;
    color: var(--text);
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
  }
  .lb {
    width: min(1200px, 94vw);
    max-height: 94vh;
    padding: 0;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    background: var(--bg-1);
    color: var(--text);
    overflow: visible;
  }
  .lb::backdrop {
    background: rgba(2, 8, 6, 0.86);
    backdrop-filter: blur(4px);
  }
  figure {
    margin: 0;
  }
  figure :global(.lbpic img) {
    max-height: 80vh;
    width: 100%;
    object-fit: contain;
    background: #000;
  }
  figcaption {
    display: grid;
    gap: 4px;
    padding: 12px 16px;
    font-size: var(--step--1);
    color: var(--text-dim);
  }
  .nav,
  .close {
    position: absolute;
    padding: 8px 12px;
  }
  .prev {
    left: 8px;
    top: 40%;
  }
  .next {
    right: 8px;
    top: 40%;
  }
  .close {
    right: 8px;
    top: 8px;
  }
</style>
