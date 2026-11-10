<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import HudPhoto, { type Callout } from '../lib/components/HudPhoto.svelte';
  import Fig1 from '../lib/components/Fig1.svelte';
  import Equation from '../lib/components/Equation.svelte';
  import { reveal } from '../lib/util/reveal';
  import { TABLE1, SURFACE_LABEL, type Surface, type Table1Row } from '../lib/data/paper';
  import { fmt } from '../lib/util/format';

  let site = $state<'pv' | 'forest'>('pv');

  const sf: Surface = $derived(site === 'pv' ? 'pv' : 'forest');
  const bg: Surface = $derived(site === 'pv' ? 'pvDesert' : 'forestDesert');
  const S = $derived(TABLE1[sf]);
  const B = $derived(TABLE1[bg]);

  const calloutsPv: Callout[] = [
    {
      x: 0.55, y: 0.63, px: 0.74, py: 0.18, side: 'right',
      label: 'PV field: sensible heat H', value: '358', unit: 'W m⁻²',
      caption: 'Ts 49.5 °C · Lout 583 W m⁻²', accent: 'coral'
    },
    {
      x: 0.32, y: 0.88, px: 0.27, py: 0.56, side: 'left',
      label: 'Desert: sensible heat H', value: '199', unit: 'W m⁻²',
      caption: 'Ts 49.6 °C · Lout 586 W m⁻²', accent: 'sand'
    }
  ];
  const calloutsForest: Callout[] = [
    {
      x: 0.62, y: 0.66, px: 0.75, py: 0.42, side: 'right',
      label: 'Forest: sensible heat H', value: '522', unit: 'W m⁻²',
      caption: 'Ts 37.1 °C · Lout 505 W m⁻²', accent: 'coral'
    },
    {
      x: 0.42, y: 0.29, px: 0.26, py: 0.1, side: 'left',
      label: 'Desert: sensible heat H', value: '225', unit: 'W m⁻²',
      caption: 'Ts 43.9 °C · Lout 550 W m⁻²', accent: 'sand'
    }
  ];

  type Key = keyof Table1Row;
  const metrics: { key: Key; label: string; unit: string; dec: number; acc: string; note: string }[] = [
    { key: 'Rn', label: 'Net radiation Rn', unit: 'W m⁻²', dec: 0, acc: 'amber', note: 'energy load at the surface' },
    { key: 'H', label: 'Sensible heat H', unit: 'W m⁻²', dec: 0, acc: 'coral', note: 'heat convected to the air' },
    { key: 'LE', label: 'Latent heat LE', unit: 'W m⁻²', dec: 0, acc: 'cyan', note: 'evaporative cooling' },
    { key: 'Lout', label: 'Thermal emission Lout', unit: 'W m⁻²', dec: 0, acc: 'violet', note: 'longwave radiation up' },
    { key: 'Ts', label: 'Surface temperature Ts', unit: '°C', dec: 1, acc: 'amber', note: 'radiometric' },
    { key: 'dTsa', label: 'Surface − air ΔTs-a', unit: '°C', dec: 1, acc: 'sand', note: 'drives H' },
    { key: 'rH', label: 'Aerodynamic resistance rH', unit: 's m⁻¹', dec: 0, acc: 'lime', note: 'lower = easier heat transfer' }
  ];

  function signed(x: number, dec: number) {
    const s = fmt(Math.abs(x), dec);
    return x > 0 ? `+${s}` : x < 0 ? `−${s}` : s;
  }
</script>

<section class="chapter" id="energy">
  <div class="wrap">
    <SectionHeader index="04" kicker="Surface energy balance" title="Where does the heat go?">
      <p>
        A darker surface absorbs more sunlight, so its net radiation <strong>Rn</strong> rises. In a dry desert there is
        almost no water to evaporate, so nearly all of it has to leave as <strong>sensible heat H</strong>, convected into
        the air. A mobile flux lab measured all the terms of the surface energy balance, summer midday.
      </p>
    </SectionHeader>

    <div class="toggle" use:reveal>
      <div class="seg" role="group" aria-label="Choose site">
        <button aria-pressed={site === 'pv'} onclick={() => (site = 'pv')}>Desert → PV field</button>
        <button aria-pressed={site === 'forest'} onclick={() => (site = 'forest')}>Desert → Forest</button>
      </div>
      <span class="label">Table 1 · summer midday (10:00–15:00) means</span>
    </div>

    <div use:reveal>
      {#key site}
        <HudPhoto
          id={site === 'pv' ? 'pv-desert-wide' : 'forest-edge'}
          callouts={site === 'pv' ? calloutsPv : calloutsForest}
          height="min(72vh, 620px)"
          sizes="(max-width: 1320px) 100vw, 1320px"
        />
      {/key}
    </div>

    <div class="split">
      <div class="diagram" use:reveal>
        <Fig1 bind:site />
      </div>

      <div class="metrics">
        {#each metrics as m, i}
          {@const d = S[m.key].mean - B[m.key].mean}
          <div class="metric panel ticks" style:--acc="var(--{m.acc})" use:reveal={{ delay: i * 50 }}>
            <div class="label">{m.label}</div>
            <div class="vals">
              <span class="num big">{fmt(S[m.key].mean, m.dec)}</span>
              <span class="mono vs">vs {fmt(B[m.key].mean, m.dec)} {m.unit}</span>
            </div>
            <div class="mono diff" class:pos={d > 0} class:neg={d < 0}>Δ {signed(d, m.dec)} {m.unit}</div>
            <div class="note">{m.note}</div>
          </div>
        {/each}
      </div>
    </div>

    <div class="insights">
      <article class="panel ticks ins" use:reveal style:--acc="var(--lime)">
        <div class="label">Finding: PV field</div>
        <h3 class="display">No hotter surface, much more H</h3>
        <p>
          Surface temperature and thermal emission over the PV field were indistinguishable from the desert (49.5 vs
          49.6 °C; ΔLout = 3 W m⁻², P = 0.46). The extra energy left as sensible heat: <strong>about +160 W m⁻²</strong>.
          That is far more than the 25–50 W m⁻² reported for a PV field in Arizona. Air temperature 5 m above the field was
          not significantly different either.
        </p>
      </article>
      <article class="panel ticks ins" use:reveal={{ delay: 100 }} style:--acc="var(--pine)">
        <div class="label">Finding: forest</div>
        <h3 class="display">The convector effect</h3>
        <p>
          The forest surface was <strong>~7 °C cooler</strong> than the desert, yet it released <strong>+297 W m⁻²</strong>
          more H. With half the PV field's surface–air temperature difference, it still moved ~1.45× its H, because its
          rough canopy cut the aerodynamic resistance rH by ~3.4×:
        </p>
        <Equation tex={String.raw`H = \frac{\rho\, c_p\, \Delta T_{s-a}}{r_H}`} label="Eq. 2" />
      </article>
      <article class="panel ticks ins" use:reveal={{ delay: 200 }} style:--acc="var(--amber)">
        <div class="label">But globally</div>
        <h3 class="display">Local cooling ≠ global cooling</h3>
        <p>
          Heat convected into the boundary layer stays in the climate system. The forest cools its own surface, but the
          darker land still adds a positive radiative forcing, unless the carbon it takes up pays it back quickly. That is
          the break-even question.
        </p>
      </article>
    </div>

    <details class="hud tbl" use:reveal>
      <summary>Table 1 · all values (mean ± SD)</summary>
      <div class="inner table-scroll">
        <table class="hud">
          <thead>
            <tr>
              <th scope="col">Variable</th>
              {#each ['pv', 'pvDesert', 'forest', 'forestDesert'] as const as s}
                <th scope="col">{SURFACE_LABEL[s]}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each metrics as m}
              <tr>
                <th scope="row">{m.label} <span class="sd">({m.unit})</span></th>
                {#each ['pv', 'pvDesert', 'forest', 'forestDesert'] as const as s}
                  <td>{fmt(TABLE1[s][m.key].mean, m.dec)} <span class="sd">± {fmt(TABLE1[s][m.key].sd, m.dec)}</span></td>
                {/each}
              </tr>
            {/each}
            <tr>
              <th scope="row">Ta <span class="sd">(°C)</span></th>
              {#each ['pv', 'pvDesert', 'forest', 'forestDesert'] as const as s}
                <td>{fmt(TABLE1[s].Ta.mean, 1)} <span class="sd">± {fmt(TABLE1[s].Ta.sd, 1)}</span></td>
              {/each}
            </tr>
          </tbody>
        </table>
        <p class="tnote">
          Energy balance: Rn = Sin(1 − α) + Lin − Lout = H + LE + G + PVe + B. Soil heat storage G was not measured.
          Random flux error ≈ 10 W m⁻² (H) and 7 W m⁻² (LE).
        </p>
      </div>
    </details>
  </div>
</section>

<style>
  .toggle {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .split {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    gap: 14px;
    margin-top: 14px;
  }
  .metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    align-content: start;
  }
  .metric {
    padding: 12px 14px;
    border-top: 2px solid var(--acc);
  }
  .metric:last-child {
    grid-column: 1 / -1;
  }
  .vals {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }
  .big {
    font-size: var(--step-2);
    color: var(--acc);
    text-shadow: 0 0 18px color-mix(in srgb, var(--acc) 35%, transparent);
  }
  .vs {
    font-size: var(--step--2);
    color: var(--text-faint);
  }
  .diff {
    font-size: var(--step--1);
    margin-top: 4px;
    color: var(--text-dim);
  }
  .diff.pos {
    color: var(--coral);
  }
  .diff.neg {
    color: var(--cyan);
  }
  .note {
    font-size: var(--step--2);
    color: var(--text-faint);
    margin-top: 2px;
  }
  .insights {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }
  .ins {
    padding: 20px;
    border-top: 2px solid var(--acc);
  }
  .ins h3 {
    font-size: var(--step-0);
    line-height: 1.3;
    margin: 10px 0;
  }
  .ins p {
    font-size: var(--step--1);
  }
  .tbl {
    margin-top: 14px;
  }
  .tnote {
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--text-faint);
    margin-top: 12px;
    max-width: none;
  }
  @media (max-width: 1040px) {
    .split,
    .insights {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 480px) {
    .metrics {
      grid-template-columns: 1fr;
    }
  }
</style>
