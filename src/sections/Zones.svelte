<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import LandSquares, { type LandItem } from '../lib/components/LandSquares.svelte';
  import { reveal } from '../lib/util/reveal';
  import { LAND, TABLE3, ZONES, ZONE_LABEL, type ZoneKey } from '../lib/data/paper';
  import { computeBet } from '../lib/model/bet';
  import {
    FOREST_DRYLAND_HIGH,
    FOREST_DRYLAND_LOW,
    FOREST_TEMPERATE,
    FOREST_TROPICAL,
    PV_TEMPERATE,
    PV_TROPICAL,
    pvDrylands
  } from '../lib/model/presets';
  import { scaleLog } from 'd3-scale';
  import { fmt } from '../lib/util/format';

  let zone = $state<ZoneKey>('drylands');
  const t = $derived(TABLE3[zone]);

  // modelled BET ranges for the bar chart (labels use the printed values)
  const bets: Record<ZoneKey, { forest: [number, number]; pv: [number, number] }> = {
    drylands: {
      forest: [computeBet(FOREST_DRYLAND_HIGH.inputs).bet, computeBet(FOREST_DRYLAND_LOW.inputs).bet],
      pv: [computeBet(pvDrylands('coal')).bet, computeBet(pvDrylands('gas')).bet]
    },
    temperate: {
      forest: [computeBet(FOREST_TEMPERATE.inputs).bet, computeBet(FOREST_TEMPERATE.inputs).bet],
      pv: [
        computeBet({ ...PV_TEMPERATE.inputs, co2f: 0.87 }).bet,
        computeBet({ ...PV_TEMPERATE.inputs, co2f: 0.4 }).bet
      ]
    },
    tropical: {
      forest: [computeBet(FOREST_TROPICAL.inputs).bet, computeBet(FOREST_TROPICAL.inputs).bet],
      pv: [
        computeBet({ ...PV_TROPICAL.inputs, co2f: 0.87 }).bet,
        computeBet({ ...PV_TROPICAL.inputs, co2f: 0.4 }).bet
      ]
    }
  };
  const x = scaleLog().domain([0.2, 300]).range([0, 100]).clamp(true);
  const ticks = [1, 10, 100];

  const forestRequired = $derived(
    zone === 'drylands'
      ? { value: LAND.drylandForestRequired[1], low: LAND.drylandForestRequired[0] }
      : { value: parseFloat(t.forest.requiredMkm2) }
  );
  const items = $derived<LandItem[]>([
    {
      label: 'Afforestation needed',
      ...forestRequired,
      color: 'var(--amber)',
      caption: `at ${t.forest.sink} kgC m⁻² yr⁻¹`
    },
    {
      label: 'Available for afforestation',
      value: t.forest.availableMkm2,
      color: 'var(--pine)',
      dashed: true,
      caption: zone === 'drylands' ? 'Rohatyn et al. 2021' : 'Griscom et al. 2017'
    },
    {
      label: 'PV field needed',
      value: t.pv.requiredMkm2,
      color: 'var(--lime)',
      caption: `≈ the area of Sweden (${LAND.sweden} Mkm²)`
    }
  ]);
</script>

<section class="chapter" id="zones">
  <div class="wrap">
    <SectionHeader index="06" kicker="Global perspective" title="Climate zones and land">
      <p>
        By 2050 the world may need <strong>55,000 TWh</strong> of electricity a year. Made from the global fossil mix,
        that emits about <strong>6.6 GtC per year</strong>. How much land would it take to cancel that out, by planting
        forests or by replacing the fossil electricity with PV?
      </p>
    </SectionHeader>

    <div class="tabs" use:reveal>
      <div class="seg" role="group" aria-label="Climate zone">
        {#each ZONES as z}
          <button aria-pressed={zone === z} onclick={() => (zone = z)}>{ZONE_LABEL[z]}</button>
        {/each}
      </div>
      <span class="label">Table 3 · {t.site}</span>
    </div>

    <div class="grid">
      <div class="cards">
        <article class="card panel ticks" style:--acc="var(--amber)" use:reveal>
          <div class="label">Afforestation · {ZONE_LABEL[zone]}</div>
          <div class="big num">{t.forest.bet}<span class="unit">years to break even</span></div>
          <dl>
            <div><dt class="label">Albedo, forest vs background</dt><dd class="mono">{t.forest.albedo} / {t.forest.background}</dd></div>
            <div><dt class="label">Δα</dt><dd class="mono c-amber">{t.forest.dAlbedo}</dd></div>
            <div><dt class="label">Carbon sequestration</dt><dd class="mono c-lime">{t.forest.sink} <small>kgC m⁻² yr⁻¹</small></dd></div>
            <div><dt class="label">Land needed vs available</dt><dd class="mono">{t.forest.requiredMkm2} / {t.forest.availableMkm2} <small>Mkm²</small></dd></div>
          </dl>
        </article>
        <article class="card panel ticks" style:--acc="var(--lime)" use:reveal={{ delay: 100 }}>
          <div class="label">PV field · {ZONE_LABEL[zone]}</div>
          <div class="big num">{t.pv.bet}<span class="unit">years to break even</span></div>
          <dl>
            <div><dt class="label">Albedo, PV field vs background</dt><dd class="mono">{t.pv.albedo} / {t.pv.background}</dd></div>
            <div><dt class="label">Δα</dt><dd class="mono c-amber">{t.pv.dAlbedo}</dd></div>
            <div><dt class="label">Emissions suppressed (world mix)</dt><dd class="mono c-lime">{t.pv.ces} <small>kgC m⁻² yr⁻¹</small></dd></div>
            <div><dt class="label">Land needed</dt><dd class="mono">{t.pv.requiredMkm2} <small>Mkm²</small></dd></div>
            <div><dt class="label">Land efficiency · panel efficiency</dt><dd class="mono">{t.pv.landEff} · {t.pv.panelEff}</dd></div>
            <div><dt class="label">EPa · irradiance</dt><dd class="mono">{t.pv.EPa} · {fmt(t.pv.Eg_kWh)} <small>kWh m⁻² yr⁻¹</small></dd></div>
          </dl>
        </article>

        <div class="betbars panel ticks" use:reveal={{ delay: 150 }}>
          <div class="label">Break-even time across zones (years, log scale)</div>
          {#each ZONES as z}
            <div class="bz" class:sel={z === zone}>
              <div class="label zn">{ZONE_LABEL[z]}</div>
              {#each [['forest', 'var(--amber)', TABLE3[z].forest.bet], ['pv', 'var(--lime)', TABLE3[z].pv.bet]] as const as [k, c, printed]}
                {@const [lo, hi] = bets[z][k]}
                <div class="track">
                  <div class="rng" style:left="0%" style:width="{x(hi)}%" style:--c={c}>
                    {#if hi > lo}<span class="lo" style:left="{(x(lo) / x(hi)) * 100}%"></span>{/if}
                  </div>
                  <span class="mono pv" style:left="calc({x(hi)}% + 6px)" style:color={c}>{printed}</span>
                </div>
              {/each}
            </div>
          {/each}
          <div class="axis">
            {#each ticks as tk}
              <span class="mono" style:left="{x(tk)}%">{tk}</span>
            {/each}
          </div>
          <div class="leg mono"><span style:color="var(--amber)">■ afforestation</span><span style:color="var(--lime)">■ PV field</span></div>
        </div>
      </div>

      <div class="land panel ticks" use:reveal={{ delay: 100 }}>
        <div class="label lh">Land to offset 6.6 GtC yr⁻¹ · {ZONE_LABEL[zone]}</div>
        <LandSquares {items} ref={LAND.semiaridDrylands} refLabel="Semi-arid drylands" />
        <p class="small">
          Squares are drawn to scale (area). Even in temperate and tropical zones, where forests grow faster and break even
          in 15–19 years, the land needed far exceeds what is available. Restoring forest on all suitable land worldwide
          (~18 Mkm²) would need <strong>~40×</strong> the land PV needs in drylands.
        </p>
      </div>
    </div>
  </div>
</section>

<style>
  .tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: 14px;
    align-items: start;
  }
  .cards {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 14px;
  }
  .card {
    padding: 18px;
    border-top: 2px solid var(--acc);
  }
  .big {
    font-size: var(--step-3);
    color: var(--acc);
    margin: 8px 0 14px;
    text-shadow: 0 0 26px color-mix(in srgb, var(--acc) 40%, transparent);
  }
  .big .unit {
    display: block;
    margin: 6px 0 0;
    font-size: 0.32em;
  }
  dl {
    margin: 0;
    display: grid;
    gap: 8px;
  }
  dl div {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    border-bottom: 1px solid var(--line);
    padding-bottom: 6px;
  }
  dd {
    margin: 0;
    font-size: var(--step--1);
    text-align: right;
  }
  dd small {
    color: var(--text-faint);
  }
  .betbars {
    grid-column: 1 / -1;
    padding: 18px;
  }
  .bz {
    display: grid;
    grid-template-columns: 90px 1fr;
    grid-template-rows: auto auto;
    column-gap: 12px;
    row-gap: 4px;
    margin-top: 14px;
    opacity: 0.55;
    transition: opacity 0.3s;
  }
  .bz.sel {
    opacity: 1;
  }
  .zn {
    grid-row: 1 / 3;
    align-self: center;
  }
  .track {
    position: relative;
    height: 12px;
    margin-right: 48px;
  }
  .rng {
    position: absolute;
    top: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--c) 70%, transparent));
    border-right: 2px solid var(--c);
    box-shadow: 0 0 12px color-mix(in srgb, var(--c) 35%, transparent);
    transition: width 0.6s var(--ease-out);
  }
  .lo {
    position: absolute;
    top: -2px;
    bottom: -2px;
    border-left: 2px dashed var(--c);
  }
  .pv {
    position: absolute;
    top: -3px;
    font-size: var(--step--2);
    white-space: nowrap;
  }
  .axis {
    position: relative;
    height: 18px;
    margin: 8px 48px 0 102px;
    border-top: 1px solid var(--line);
  }
  .axis span {
    position: absolute;
    top: 4px;
    transform: translateX(-50%);
    font-size: 10px;
    color: var(--text-faint);
  }
  .leg {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: var(--step--2);
  }
  .land {
    padding: 18px;
  }
  .lh {
    margin-bottom: 12px;
  }
  .small {
    font-size: var(--step--1);
    margin: 14px 0 0;
  }
  @media (max-width: 1040px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .cards {
      grid-template-columns: 1fr;
    }
    .bz {
      grid-template-columns: 70px 1fr;
    }
    .axis {
      margin-left: 82px;
    }
  }
</style>
