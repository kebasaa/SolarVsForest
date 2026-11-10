<script lang="ts">
  import HudPhoto, { type Callout } from '../lib/components/HudPhoto.svelte';
  import CountUp from '../lib/components/CountUp.svelte';
  import { PAPER } from '../lib/data/paper';

  const callouts: Callout[] = [];
</script>

<header class="hero" id="top">
  <HudPhoto
    id="hero-pv"
    {callouts}
    height="max(100svh, 640px)"
    focus="50% 74%"
    eager
    bare
    hideCompactList
    compactBelow={900}
  >
    <div class="wrap content">
      <div class="title-block">
        <div class="label meta">
          <span class="c-lime">●</span> PNAS Nexus · {PAPER.year} · Stern, Muller et al.
        </div>
        <h1 class="display">
          Solar<br />vs forest<span class="dot">.</span>
        </h1>
        <p class="sub">
          Both dark solar panels and dark forests warm the planet by reflecting less sunlight than the bright desert.
          How long until their carbon benefit pays that back? We measured it.
        </p>
        <div class="cta">
          <a class="btn primary" href="#break-even">Explore the model ↓</a>
          <a class="btn" href={PAPER.url} target="_blank" rel="noopener">Read the paper ↗</a>
          <a class="btn" href={PAPER.code} target="_blank" rel="noopener">Code ↗</a>
        </div>
      </div>

      <div class="stats">
        <div class="stat panel ticks" style:--acc="var(--lime)">
          <div class="label">Break-even time, PV field</div>
          <div class="num v">~<CountUp to={2.5} decimals={1} /><span class="unit">years</span></div>
          <div class="cap">to offset its albedo warming (world fuel mix)</div>
        </div>
        <div class="stat panel ticks" style:--acc="var(--amber)">
          <div class="label">Break-even time, dryland forest</div>
          <div class="num v"><CountUp to={94} />–<CountUp to={185} /><span class="unit">years</span></div>
          <div class="cap">more than 50× longer</div>
        </div>
        <div class="stat panel ticks" style:--acc="var(--cyan)">
          <div class="label">Carbon per m² and year</div>
          <div class="num v">~<CountUp to={100} />×<span class="unit">PV vs forest</span></div>
          <div class="cap">14.9 vs 0.15 kgC m⁻² yr⁻¹</div>
        </div>
      </div>
    </div>
  </HudPhoto>
  <div class="loc label"><span class="c-lime">◉</span> Ketura PV field · Arava valley, Israel · 4.9 MW · Photo: J. D. Müller</div>
  <a class="scroll label" href="#question" aria-label="Scroll to the question">Scroll<span>↓</span></a>
</header>

<style>
  .hero {
    position: relative;
  }
  .content {
    position: relative;
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
    align-items: end;
    gap: 32px;
    padding-top: calc(var(--nav-h) + 40px);
    padding-bottom: clamp(48px, 9vh, 96px);
    pointer-events: none;
  }
  .content :global(a),
  .content .stat {
    pointer-events: auto;
  }
  .title-block {
    max-width: 760px;
  }
  .meta {
    color: var(--text-dim);
    margin-bottom: 18px;
  }
  h1 {
    font-size: var(--step-4);
    line-height: 1.02;
    text-shadow: 0 2px 30px rgba(0, 0, 0, 0.6);
  }
  .dot {
    color: var(--lime);
  }
  .sub {
    margin-top: 22px;
    font-size: var(--step-1);
    line-height: 1.5;
    color: #dbe9e1;
    max-width: 46ch;
    text-shadow: 0 1px 16px rgba(0, 0, 0, 0.8);
  }
  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 26px;
  }
  .stats {
    display: grid;
    gap: 10px;
    align-self: start;
    margin-top: 6vh;
  }
  .stat {
    padding: 14px 16px;
    border-top: 2px solid var(--acc);
    background: rgba(6, 20, 16, 0.72);
  }
  .stat .v {
    font-size: var(--step-2);
    color: var(--acc);
    margin-top: 6px;
    text-shadow: 0 0 22px color-mix(in srgb, var(--acc) 40%, transparent);
    white-space: nowrap;
  }
  .stat .cap {
    font-size: var(--step--1);
    color: var(--text-dim);
    margin-top: 4px;
  }
  .loc {
    position: absolute;
    right: var(--gutter);
    bottom: 18px;
    color: var(--text-dim);
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
  }
  .scroll {
    position: absolute;
    left: 50%;
    bottom: 18px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    color: var(--text-dim);
    text-decoration: none;
  }
  .scroll span {
    animation: pulse 2s infinite;
    color: var(--lime);
  }
  @media (max-width: 900px) {
    .content {
      grid-template-columns: 1fr;
      align-items: end;
      align-content: end;
    }
    .stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      margin-top: 0;
      order: 2;
    }
    .stat .v {
      font-size: var(--step-1);
    }
    .scroll,
    .loc {
      display: none;
    }
  }
  @media (max-width: 560px) {
    .stats {
      grid-template-columns: 1fr;
    }
    .stat .cap {
      display: none;
    }
  }
</style>
