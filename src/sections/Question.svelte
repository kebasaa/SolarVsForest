<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import Equation from '../lib/components/Equation.svelte';
  import { reveal } from '../lib/util/reveal';
  import { computeBet } from '../lib/model/bet';
  import { FOREST_YATIR, pvDrylands } from '../lib/model/presets';
  import { fmt, pct } from '../lib/util/format';

  const pv = computeBet(pvDrylands('world'));
  const forest = computeBet(FOREST_YATIR.inputs);

  let years = $state(1);
  const pvShare = $derived(Math.min(1, (years * pv.rfc) / pv.rfrGlobal));
  const forestShare = $derived(Math.min(1, (years * forest.rfc) / forest.rfrGlobal));

  const steps = [
    {
      n: '01',
      acc: 'amber',
      title: 'A darker surface',
      text: 'Bright desert reflects a lot of sunlight. Panels and pine canopies are dark, so the land absorbs more energy. That is a positive radiative forcing (RFr): a one-off step that warms the planet for as long as the land cover stays.'
    },
    {
      n: '02',
      acc: 'lime',
      title: 'A carbon benefit, every year',
      text: 'A PV field suppresses fossil emissions each year it runs; a forest takes carbon out of the air each year it grows. Either way, every year adds a bit more negative forcing (RFc).'
    },
    {
      n: '03',
      acc: 'cyan',
      title: 'The break-even time',
      text: 'The break-even time (BET) is the number of years n after which the accumulated carbon benefit cancels the albedo penalty: n · RFc = RFr. Before that, the land-use change is a net warming.'
    }
  ] as const;
</script>

<section class="chapter" id="question">
  <div class="wrap">
    <SectionHeader index="01" kicker="The question" title="Two dark surfaces">
      <p>
        Drylands cover a huge share of Earth's land, and they are where land is still available for two major
        climate-mitigation strategies: <strong>solar PV fields</strong> and <strong>afforestation</strong>. But both
        replace a bright, reflective surface with a dark one.
      </p>
    </SectionHeader>

    <div class="steps">
      {#each steps as s, i}
        <article class="step panel ticks" use:reveal={{ delay: i * 120 }} style:--acc="var(--{s.acc})">
          <div class="label">Step <span class="n">{s.n}</span></div>
          <h3 class="display">{s.title}</h3>
          <p>{s.text}</p>
        </article>
      {/each}
    </div>

    <div class="balance panel ticks" use:reveal>
      <div class="eqcol">
        <div class="label">Break-even condition (Eq. M2)</div>
        <Equation tex={String.raw`n \cdot \mathrm{RF_c} = \mathrm{RF_r}`} />
        <p class="small">
          Drag the years to see how much of each surface's albedo warming has been paid back, with the paper's numbers for the
          Ketura PV field (world fuel mix) and the Yatir forest.
        </p>
        <label class="yr">
          <span class="label">Years after installation</span>
          <span class="num big">{fmt(years, years < 10 ? 1 : 0)}<span class="unit">yr</span></span>
          <input
            type="range"
            min="0"
            max="200"
            step="0.5"
            bind:value={years}
            style:--pct={pct(years, 0, 200)}
            aria-label="Years after installation"
          />
        </label>
      </div>
      <div class="bars">
        {#each [{ name: 'PV field · Ketura', share: pvShare, bet: pv.bet, acc: 'lime' }, { name: 'Afforestation · Yatir', share: forestShare, bet: forest.bet, acc: 'amber' }] as b}
          <div class="bar" style:--acc="var(--{b.acc})">
            <div class="row">
              <span class="label">{b.name}</span>
              <span class="mono pctv">{fmt(b.share * 100, b.share < 0.1 ? 1 : 0)} %</span>
            </div>
            <div class="track" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(b.share * 100)} aria-label="{b.name}: share of albedo warming offset">
              <div class="fill" style:width="{b.share * 100}%"></div>
            </div>
            <div class="row foot">
              <span class="mono">BET {fmt(b.bet, 1)} yr</span>
              <span class="mono state" class:done={b.share >= 1}>{b.share >= 1 ? 'Net cooling ✓' : 'Net warming'}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  .step {
    padding: 22px;
    border-top: 2px solid var(--acc);
  }
  .step .n {
    color: var(--acc);
  }
  .step h3 {
    font-size: var(--step-0);
    margin: 14px 0 10px;
    line-height: 1.3;
  }
  .step p {
    font-size: var(--step--1);
    margin: 0;
  }
  .balance {
    margin-top: 14px;
    padding: clamp(18px, 3vw, 32px);
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(20px, 4vw, 56px);
    align-items: center;
  }
  .small {
    font-size: var(--step--1);
  }
  .yr {
    display: grid;
    gap: 6px;
  }
  .big {
    font-size: var(--step-3);
    color: var(--text);
  }
  .bars {
    display: grid;
    gap: 26px;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .pctv {
    font-size: var(--step-1);
    color: var(--acc);
  }
  .track {
    position: relative;
    height: 16px;
    margin: 8px 0;
    border: 1px solid var(--line);
    background:
      repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), var(--grid) calc(10% - 1px) 10%),
      rgba(5, 14, 11, 0.6);
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, color-mix(in srgb, var(--acc) 40%, transparent), var(--acc));
    box-shadow: 0 0 16px color-mix(in srgb, var(--acc) 50%, transparent);
    transition: width 0.25s var(--ease-out);
  }
  .foot {
    font-size: var(--step--2);
    color: var(--text-faint);
  }
  .state {
    color: var(--amber);
  }
  .state.done {
    color: var(--lime);
  }
  @media (max-width: 860px) {
    .steps,
    .balance {
      grid-template-columns: 1fr;
    }
  }
</style>
