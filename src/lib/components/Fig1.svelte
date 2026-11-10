<script lang="ts">
  /**
   * Interactive version of Fig. 1 of Stern, Muller et al. (2023), PNAS Nexus 2(11):pgad352
   * (CC BY 4.0). The artwork (photo id `fig1-art`, adapted for a dark page, no text) is overlaid
   * with HTML labels whose values come from Table 1 / Fig. 1 / Table 2, so they can be switched
   * between absolute values and changes relative to the desert background.
   */
  import Picture from './Picture.svelte';
  import { PAPER, FIG1_ALBEDO, TABLE1, TABLE2, HEADLINE, type Surface } from '../data/paper';
  import { fmt } from '../util/format';

  interface Props {
    site: 'pv' | 'forest';
  }
  let { site = $bindable() }: Props = $props();

  let mode = $state<'abs' | 'delta'>('abs');

  type Kind = 'alb' | 'Lout' | 'H' | 'LE' | 'C' | 'Ts';
  interface Lab {
    surface: Surface;
    kind: Kind;
    x: number;
    y: number;
    align?: 'l' | 'r' | 'c';
  }
  // label anchor positions as fractions of the artwork (1478 × 1064 px)
  const labels: Lab[] = [
    // D · PV field (elevated group, left)
    { surface: 'pv', kind: 'alb', x: 0.118, y: 0.365, align: 'r' },
    { surface: 'pv', kind: 'Lout', x: 0.152, y: 0.235, align: 'r' },
    { surface: 'pv', kind: 'H', x: 0.252, y: 0.16, align: 'r' },
    { surface: 'pv', kind: 'C', x: 0.098, y: 0.56, align: 'r' },
    // C · desert next to PV
    { surface: 'pvDesert', kind: 'alb', x: 0.392, y: 0.672, align: 'r' },
    { surface: 'pvDesert', kind: 'Lout', x: 0.518, y: 0.635, align: 'l' },
    { surface: 'pvDesert', kind: 'H', x: 0.572, y: 0.705, align: 'l' },
    // A · desert next to the forest
    { surface: 'forestDesert', kind: 'alb', x: 0.4, y: 0.4, align: 'r' },
    { surface: 'forestDesert', kind: 'Lout', x: 0.45, y: 0.33, align: 'r' },
    { surface: 'forestDesert', kind: 'H', x: 0.556, y: 0.415, align: 'l' },
    // B · forest (elevated group, right)
    { surface: 'forest', kind: 'alb', x: 0.535, y: 0.245, align: 'r' },
    { surface: 'forest', kind: 'Lout', x: 0.585, y: 0.155, align: 'r' },
    { surface: 'forest', kind: 'H', x: 0.622, y: 0.055, align: 'r' },
    { surface: 'forest', kind: 'LE', x: 0.738, y: 0.06, align: 'c' },
    { surface: 'forest', kind: 'C', x: 0.845, y: 0.04, align: 'l' },
    { surface: 'forest', kind: 'Ts', x: 0.818, y: 0.55, align: 'l' }
  ];

  const letters: { key: string; surface: Surface; site: 'pv' | 'forest'; x: number; y: number; label: string }[] = [
    { key: 'A', surface: 'forestDesert', site: 'forest', x: 0.369, y: 0.459, label: 'Desert next to the forest' },
    { key: 'B', surface: 'forest', site: 'forest', x: 0.648, y: 0.697, label: 'Yatir forest' },
    { key: 'C', surface: 'pvDesert', site: 'pv', x: 0.413, y: 0.862, label: 'Desert next to the PV field' },
    { key: 'D', surface: 'pv', site: 'pv', x: 0.117, y: 0.65, label: 'PV field' }
  ];

  const legend: { x: number; y: number; text: string }[] = [
    { x: 0.754, y: 0.878, text: 'Reflected S<sub>in</sub> (albedo)' },
    { x: 0.9, y: 0.878, text: 'Thermal emission' },
    { x: 0.628, y: 0.976, text: 'H (sensible heat)' },
    { x: 0.795, y: 0.976, text: 'LE (latent heat)' },
    { x: 0.934, y: 0.976, text: 'C flux' }
  ];

  const siteOf = (s: Surface) => (s === 'pv' || s === 'pvDesert' ? 'pv' : 'forest');
  const background = (s: Surface): Surface | null => (s === 'pv' ? 'pvDesert' : s === 'forest' ? 'forestDesert' : null);

  const NAME: Record<Kind, string> = {
    alb: 'Albedo (reflected fraction of sunlight)',
    Lout: 'Thermal emission, Lout',
    H: 'Sensible heat flux, H',
    LE: 'Latent heat flux, LE',
    C: 'Carbon',
    Ts: 'Surface temperature vs desert'
  };

  function signed(x: number, d: number) {
    const s = fmt(Math.abs(x), d);
    return x > 0 ? `+${s}` : x < 0 ? `−${s}` : s;
  }

  /** value + unit shown in the label, and the longer tooltip text */
  function content(l: Lab): { v: string; u: string; tip: string } {
    const bg = background(l.surface);
    const delta = mode === 'delta' && bg !== null;
    switch (l.kind) {
      case 'alb': {
        const a = FIG1_ALBEDO[l.surface];
        if (delta) return { v: signed(a - FIG1_ALBEDO[bg!], 2), u: 'Δα', tip: `Albedo ${a.toFixed(2)} vs ${FIG1_ALBEDO[bg!].toFixed(2)} in the desert (summer midday)` };
        return { v: a.toFixed(2), u: '', tip: `${NAME.alb}: ${a.toFixed(2)}, summer midday` };
      }
      case 'Lout':
      case 'H':
      case 'LE': {
        const t = TABLE1[l.surface][l.kind];
        if (delta) {
          const b = TABLE1[bg!][l.kind];
          return { v: signed(t.mean - b.mean, 0), u: 'W m⁻²', tip: `${NAME[l.kind]}: ${t.mean} vs ${b.mean} W m⁻² in the desert` };
        }
        return { v: String(t.mean), u: 'W m⁻²', tip: `${NAME[l.kind]}: ${t.mean} ± ${t.sd} W m⁻² (mean ± SD, summer midday)` };
      }
      case 'C':
        return l.surface === 'pv'
          ? { v: fmt(TABLE2.ces.world, 1), u: 'kgC m⁻² yr⁻¹', tip: 'Carbon emissions suppressed by the PV field (world fuel mix)' }
          : { v: fmt(TABLE2.forestSink[0], 2), u: 'kgC m⁻² yr⁻¹', tip: 'Carbon sequestered by the Yatir forest' };
      case 'Ts': {
        const d = TABLE1.forest.Ts.mean - TABLE1.forestDesert.Ts.mean;
        return { v: `−${HEADLINE.forestCooling}`, u: '°C', tip: `Forest surface ${TABLE1.forest.Ts.mean} °C vs desert ${TABLE1.forestDesert.Ts.mean} °C (Δ ${fmt(d, 1)} °C)` };
      }
    }
  }

  const colour: Record<Kind, string> = {
    alb: 'var(--amber)',
    Lout: 'var(--violet)',
    H: 'var(--coral)',
    LE: 'var(--cyan)',
    C: 'var(--lime)',
    Ts: 'var(--cyan)'
  };
</script>

<figure class="fig1">
  <div class="bar">
    <div class="seg" role="group" aria-label="Figure values">
      <button aria-pressed={mode === 'abs'} onclick={() => (mode = 'abs')}>Values</button>
      <button aria-pressed={mode === 'delta'} onclick={() => (mode = 'delta')}>Change vs desert</button>
    </div>
  </div>

  <div class="plate art">
    <Picture id="fig1-art" sizes="(max-width: 1040px) 100vw, 720px" />
    {#each letters as L}
      <button
        class="letter"
        class:on={site === L.site}
        style:left="{L.x * 100}%"
        style:top="{L.y * 100}%"
        onclick={() => (site = L.site)}
        aria-pressed={site === L.site}
        aria-label="Panel {L.key}: {L.label}"
        title="{L.key} · {L.label}"
      ></button>
    {/each}
    {#each labels as l}
      {@const c = content(l)}
      <button
        class="val {l.align ?? 'c'}"
        class:dim={siteOf(l.surface) !== site}
        style:left="{l.x * 100}%"
        style:top="{l.y * 100}%"
        style:--c={colour[l.kind]}
        onclick={() => (site = siteOf(l.surface))}
        aria-label="{c.tip}"
      >
        <span class="v">{c.v}</span>{#if c.u}<span class="u">{c.u}</span>{/if}
        <span class="tip" role="tooltip">{c.tip}</span>
      </button>
    {/each}
    {#each legend as g}
      <span class="lg" style:left="{g.x * 100}%" style:top="{g.y * 100}%">{@html g.text}</span>
    {/each}
  </div>

  <figcaption>
    <span class="label">Fig. 1 · land-use change effects, summer midday</span>
    <span>
      Desert-to-afforestation (A, B) and desert-to-PV (C, D). Arrow size shows magnitude; straight arrows are radiative,
      curved arrows non-radiative fluxes. Click a letter or value to switch site; hover a value for details.
    </span>
    <span class="mlegend mono">
      <span style:--c="var(--amber)">Reflected S<sub>in</sub> (albedo)</span>
      <span style:--c="var(--violet)">Thermal emission</span>
      <span style:--c="var(--coral)">H (sensible heat)</span>
      <span style:--c="var(--cyan)">LE (latent heat)</span>
      <span style:--c="var(--lime)">C flux</span>
    </span>
    <span class="credit">
      Adapted from Fig. 1 of Stern, Muller et al. (2023), “{PAPER.title}”, <em>PNAS Nexus</em>
      2(11):pgad352, <a href={PAPER.url} target="_blank" rel="noopener">doi:{PAPER.doi}</a>. © The Author(s) 2023, published
      by Oxford University Press on behalf of the National Academy of Sciences, licensed under
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>.
      Changes: artwork redrawn for a dark page without text; values re-typeset as interactive labels from Table 1.
    </span>
  </figcaption>
</figure>

<style>
  .fig1 {
    margin: 0;
  }
  .bar {
    margin-bottom: 10px;
  }
  .plate {
    position: relative;
    container-type: inline-size;
  }
  .plate.art :global(picture) {
    background-image: none !important;
  }

  .letter {
    position: absolute;
    width: 6.5%;
    aspect-ratio: 1;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid transparent;
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .letter:hover {
    border-color: var(--line-strong);
  }
  .letter.on {
    border-color: var(--lime);
    box-shadow: 0 0 0 4px rgba(184, 255, 90, 0.14), var(--glow-lime);
    animation: pulse 2.4s ease-in-out infinite;
  }

  .val {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0.15em 0.3em;
    border: 0;
    border-radius: 3px;
    background: rgba(5, 14, 11, 0.55);
    color: #fff;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: clamp(9px, 1.55cqw, 16px);
    line-height: 1.1;
    white-space: nowrap;
    cursor: pointer;
    transition: opacity 0.3s, background 0.2s;
    box-shadow: inset 0 -2px 0 var(--c);
  }
  .val.c {
    transform: translate(-50%, -50%);
    align-items: center;
  }
  .val.r {
    transform: translate(-100%, -50%);
    align-items: flex-end;
  }
  .val.l {
    transform: translate(0, -50%);
    align-items: flex-start;
  }
  .val .v {
    font-variant-numeric: tabular-nums;
  }
  .val .u {
    font-weight: 600;
    font-size: 0.78em;
    opacity: 0.9;
  }
  .val.dim {
    opacity: 0.45;
  }
  .val:hover,
  .val:focus-visible {
    opacity: 1;
    background: rgba(5, 14, 11, 0.9);
    z-index: 3;
  }
  .tip {
    display: none;
    position: absolute;
    top: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: 220px;
    white-space: normal;
    padding: 6px 8px;
    font-family: var(--font-mono);
    font-weight: 400;
    font-size: 11px;
    line-height: 1.35;
    text-align: left;
    color: var(--text);
    background: var(--panel-strong);
    border: 1px solid var(--c);
    border-radius: 2px;
    pointer-events: none;
  }
  .val:hover .tip,
  .val:focus-visible .tip {
    display: block;
  }
  .lg {
    position: absolute;
    transform: translate(-50%, -50%);
    font-family: var(--font-body);
    font-weight: 600;
    font-size: clamp(8px, 1.3cqw, 14px);
    color: var(--text);
    white-space: nowrap;
    pointer-events: none;
  }
  @container (max-width: 520px) {
    .val .u {
      display: none;
    }
    .lg {
      display: none;
    }
  }

  figcaption {
    display: grid;
    gap: 6px;
    margin-top: 12px;
    font-size: var(--step--1);
    color: var(--text-dim);
    line-height: 1.5;
  }
  .mlegend {
    display: none;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: var(--step--2);
  }
  .mlegend span::before {
    content: '';
    display: inline-block;
    width: 9px;
    height: 9px;
    margin-right: 6px;
    background: var(--c);
  }
  @media (max-width: 640px) {
    .mlegend {
      display: flex;
    }
  }
  .credit {
    font-family: var(--font-mono);
    font-size: var(--step--2);
    color: var(--text-faint);
  }
</style>
