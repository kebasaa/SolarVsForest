<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import CompareSlider from '../lib/components/CompareSlider.svelte';
  import { reveal } from '../lib/util/reveal';
  import { ANNUAL_ALBEDO, FIG1_ALBEDO } from '../lib/data/paper';
  import { KETURA } from '../lib/model/constants';
  import { fmt } from '../lib/util/format';

  let mode = $state<'annual' | 'summer'>('annual');

  const sets = {
    annual: {
      note: 'Annual means. These enter the break-even calculation.',
      pvDesert: ANNUAL_ALBEDO.pvDesert.mean,
      pv: ANNUAL_ALBEDO.pv.mean,
      forestDesert: ANNUAL_ALBEDO.forestDesert.mean,
      forest: ANNUAL_ALBEDO.forest.mean
    },
    summer: {
      note: 'Summer midday values, as shown in Fig. 1 of the paper.',
      pvDesert: FIG1_ALBEDO.pvDesert,
      pv: FIG1_ALBEDO.pv,
      forestDesert: FIG1_ALBEDO.forestDesert,
      forest: FIG1_ALBEDO.forest
    }
  } as const;

  const s = $derived(sets[mode]);
  const groups = $derived([
    {
      name: 'PV transition',
      acc: 'lime',
      bars: [
        { label: 'Desert', v: s.pvDesert, color: 'var(--sand)' },
        { label: 'PV field', v: s.pv, color: 'var(--lime)' }
      ],
      d: s.pvDesert - s.pv
    },
    {
      name: 'Forest transition',
      acc: 'pine',
      bars: [
        { label: 'Desert', v: s.forestDesert, color: 'var(--sand)' },
        { label: 'Forest', v: s.forest, color: 'var(--pine)' }
      ],
      d: s.forestDesert - s.forest
    }
  ]);
  const Eg = KETURA.meanSWin_W_m2;
  const maxA = 0.45;
</script>

<section class="chapter" id="albedo">
  <div class="wrap">
    <SectionHeader index="03" kicker="Albedo" title="The albedo catch">
      <p>
        Installing the PV field cut the surface albedo by about <strong>45 %</strong>, from 0.38 to 0.17. Planting the
        forest darkened its desert from 0.28 to 0.12. With an annual mean of 245 W m⁻² of sunlight, every 0.01 of albedo
        lost means about <strong>2.5 W m⁻²</strong> more energy absorbed at the surface, on average, all year round.
      </p>
    </SectionHeader>

    <div class="grid">
      <div use:reveal>
        <CompareSlider
          left={{ id: 'nadir-pv', label: 'PV field, annual α', value: '0.17' }}
          right={{ id: 'nadir-forest', label: 'Yatir forest, annual α', value: '0.12' }}
        />
        <p class="cap label">Drag to compare · nadir drone images · Photos: Jonathan D. Müller</p>
      </div>

      <div class="chart panel ticks" use:reveal={{ delay: 120 }}>
        <div class="head">
          <div class="label">Surface albedo α: fraction of sunlight reflected</div>
          <div class="seg" role="group" aria-label="Albedo period">
            <button aria-pressed={mode === 'annual'} onclick={() => (mode = 'annual')}>Annual</button>
            <button aria-pressed={mode === 'summer'} onclick={() => (mode = 'summer')}>Summer midday</button>
          </div>
        </div>

        <div class="groups">
          {#each groups as g}
            <div class="group" style:--acc="var(--{g.acc})">
              <div class="label gname">{g.name}</div>
              <div class="bars">
                {#each g.bars as b}
                  <div class="col">
                    <div class="slot">
                      <div class="bar" style:height="{(b.v / maxA) * 100}%" style:--c={b.color}>
                        <span class="val num">{b.v.toFixed(2)}</span>
                      </div>
                    </div>
                    <div class="label">{b.label}</div>
                  </div>
                {/each}
              </div>
              <div class="delta">
                <span class="label">Δα</span>
                <span class="num c-amber">{g.d.toFixed(2)}</span>
                <span class="mono extra">≈ +{fmt(g.d * Eg, 0)} W m⁻² absorbed*</span>
              </div>
            </div>
          {/each}
        </div>
        <p class="foot">
          {s.note} PV panels themselves have α ≈ 0.05; the whole field is brighter because of the sunlit soil between rows.
          <br />* Δα × 245 W m⁻², the annual mean incoming shortwave radiation at Ketura.
        </p>
      </div>
    </div>

    <div class="how" use:reveal>
      <div class="label">How the PV-field albedo was obtained</div>
      <p>
        The field operator's height limits ruled out a radiometer high enough to see the whole field. Instead, drone images
        taken throughout the day split the field into <strong>panels</strong> (51 % of the rows, α = 0.05),
        <strong>sunlit soil</strong> (desert α) and <strong>shaded soil</strong> (desert α × diffuse fraction). Cosine
        fits gave the shade fraction for every half-hour of the year, and the result was weighted by incoming sunlight.
      </p>
    </div>
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 16px;
    align-items: start;
  }
  .cap {
    margin-top: 10px;
  }
  .chart {
    padding: 18px;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }
  .groups {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  .group {
    border: 1px solid var(--line);
    padding: 12px;
    background: rgba(5, 14, 11, 0.45);
  }
  .gname {
    color: var(--acc);
    margin-bottom: 10px;
  }
  .bars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    height: 220px;
    padding-top: 26px;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  .slot {
    flex: 1;
    display: flex;
    align-items: flex-end;
    background: repeating-linear-gradient(0deg, var(--grid) 0 1px, transparent 1px 22px);
    border-bottom: 1px solid var(--line-strong);
  }
  .bar {
    position: relative;
    width: 100%;
    background: linear-gradient(180deg, var(--c), color-mix(in srgb, var(--c) 25%, transparent));
    box-shadow: 0 0 18px color-mix(in srgb, var(--c) 35%, transparent);
    transition: height 0.6s var(--ease-out);
  }
  .val {
    position: absolute;
    top: -24px;
    left: 0;
    right: 0;
    font-size: var(--step--1);
    color: var(--text);
  }
  .delta {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    margin-top: 12px;
  }
  .delta .num {
    font-size: var(--step-1);
  }
  .extra {
    font-size: var(--step--2);
    color: var(--text-dim);
  }
  .foot {
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--text-faint);
    margin: 14px 0 0;
  }
  .how {
    margin-top: 22px;
    border-left: 2px solid var(--amber);
    padding-left: 18px;
  }
  .how p {
    margin-top: 8px;
    font-size: var(--step--1);
  }
  @media (max-width: 960px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 520px) {
    .groups {
      grid-template-columns: 1fr;
    }
  }
</style>
