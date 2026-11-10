<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import BetRace, { type RaceSeries } from '../lib/components/BetRace.svelte';
  import Equation from '../lib/components/Equation.svelte';
  import InfoTip from '../lib/components/InfoTip.svelte';
  import { reveal } from '../lib/util/reveal';
  import { computeBet, type BetInputs } from '../lib/model/bet';
  import {
    A_EARTH,
    C0_PPM,
    C_PER_CO2,
    EMISSION_TARGET_GTC,
    FUEL_LABEL,
    FUELS,
    K_KGC_PER_PPM,
    LW_ESCAPE_FRACTION,
    type Fuel
  } from '../lib/model/constants';
  import {
    FOREST_DRYLAND_HIGH,
    FOREST_TEMPERATE,
    FOREST_TROPICAL,
    FOREST_YATIR,
    pvDrylands,
    type Zone
  } from '../lib/model/presets';
  import { FOREST_VARIANT_LABEL, resolveScenario, type ForestVariant, type Kind } from '../lib/model/scenario';
  import { TABLE2 } from '../lib/data/paper';
  import { fmt, fmtSig, pct, sci, sup } from '../lib/util/format';

  let kind = $state<Kind>('pv');
  let zone = $state<Zone>('drylands');
  let fuel = $state<Fuel>('world');
  let forest = $state<ForestVariant>('yatir');

  const scenario = $derived(resolveScenario({ kind, zone, fuel, forest }));
  let inputs = $state<BetInputs>(resolveScenario({ kind: 'pv', zone: 'drylands', fuel: 'world', forest: 'yatir' }).inputs);

  // whenever the scenario changes, reset the sliders to its paper defaults
  $effect(() => {
    inputs = { ...scenario.inputs };
  });

  const r = $derived(computeBet(inputs));
  const isDefault = $derived(
    (Object.keys(scenario.inputs) as (keyof BetInputs)[]).every((k) => scenario.inputs[k] === inputs[k])
  );
  const calibrated = $derived(new Map(scenario.calibration.map((c) => [c.field, c])));

  type Field = 'EPa' | 'co2f' | 'lca' | 'sink' | 'dAlbedo' | 'Eg' | 'af';
  const sliders: {
    field: Field;
    label: string;
    sym: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    dec: number;
    kinds: Kind[];
    acc: string;
  }[] = [
    { field: 'EPa', label: 'Electricity per m² of field', sym: 'EPa', unit: 'kWh m⁻² yr⁻¹', min: 20, max: 250, step: 0.1, dec: 1, kinds: ['pv'], acc: 'lime' },
    { field: 'co2f', label: 'CO₂ footprint of replaced electricity', sym: 'CO2F', unit: 'kgCO₂ kWh⁻¹', min: 0, max: 1.2, step: 0.01, dec: 2, kinds: ['pv'], acc: 'lime' },
    { field: 'lca', label: 'PV life cycle incl. storage', sym: 'LCA', unit: 'kgCO₂ kWh⁻¹', min: 0, max: 0.3, step: 0.001, dec: 3, kinds: ['pv'], acc: 'lime' },
    { field: 'sink', label: 'Forest carbon sink', sym: 'E', unit: 'kgC m⁻² yr⁻¹', min: 0.02, max: 1, step: 0.01, dec: 2, kinds: ['forest'], acc: 'pine' },
    { field: 'dAlbedo', label: 'Albedo change (background − surface)', sym: 'Δα', unit: '', min: 0, max: 0.4, step: 0.001, dec: 3, kinds: ['pv', 'forest'], acc: 'amber' },
    { field: 'Eg', label: 'Mean global radiation', sym: 'Eg', unit: 'W m⁻²', min: 50, max: 320, step: 1, dec: 0, kinds: ['pv', 'forest'], acc: 'amber' },
    { field: 'af', label: 'Carbon airborne fraction', sym: 'AF', unit: '', min: 0.3, max: 0.7, step: 0.01, dec: 2, kinds: ['pv', 'forest'], acc: 'cyan' }
  ];
  const visible = $derived(sliders.filter((s) => s.kinds.includes(kind)));

  const zones: [Zone, string][] = [
    ['drylands', 'Drylands'],
    ['temperate', 'Temperate'],
    ['tropical', 'Tropical']
  ];

  // reference series in the race chart (paper defaults)
  // fixed reference curves (paper defaults): all fossil-fuel cases of Table 2 and the three
  // afforestation climate zones of Tables 2–3
  const PV_GROUP = 'PV field (Ketura), electricity replaced';
  const FOREST_GROUP = 'Afforestation (planted forest)';
  const FUEL_DASH: Record<Fuel, string | undefined> = { coal: undefined, oil: '9 4', gas: '2 4', world: '10 3 2 3' };
  const refs: RaceSeries[] = [
    ...FUELS.map((f) => ({
      id: `pv-${f}`,
      label: FUEL_LABEL[f],
      bet: computeBet(pvDrylands(f)).bet,
      color: 'var(--lime)',
      dash: FUEL_DASH[f],
      group: PV_GROUP
    })),
    {
      id: 'forest-drylands',
      label: 'Drylands',
      betLow: computeBet(FOREST_DRYLAND_HIGH.inputs).bet,
      bet: computeBet(FOREST_YATIR.inputs).bet,
      betLabel: '94–185 yr',
      color: 'var(--amber)',
      direct: true,
      group: FOREST_GROUP
    },
    {
      id: 'forest-temperate',
      label: 'Temperate',
      bet: computeBet(FOREST_TEMPERATE.inputs).bet,
      color: 'var(--pine)',
      direct: true,
      group: FOREST_GROUP
    },
    {
      id: 'forest-tropical',
      label: 'Tropical',
      bet: computeBet(FOREST_TROPICAL.inputs).bet,
      color: 'var(--cyan)',
      direct: true,
      group: FOREST_GROUP
    }
  ];
  const series = $derived<RaceSeries[]>([
    ...refs,
    {
      id: 'current',
      label: 'Your scenario',
      bet: r.bet,
      // at the paper defaults, show the value as printed in the paper
      betLabel: isDefault && !scenario.printedBet.startsWith('<') ? `${scenario.printedBet} yr` : undefined,
      color: 'var(--text)',
      emphasis: true,
      group: 'Calculator'
    }
  ]);

  function sciParts(x: number, d = 2) {
    const s = sci(x, d);
    return `${s.m} × 10${sup(s.e)}`;
  }
</script>

<section class="chapter" id="break-even">
  <div class="wrap">
    <SectionHeader index="05" kicker="Break-even time" title="Break-even time">
      <p>
        The albedo penalty is a one-off step; the carbon benefit grows every year. The Ketura PV field pays back its
        darkening in <strong>1.4–3.6 years</strong>, depending on which fossil fuel its electricity replaces. The Yatir
        forest needs <strong>94–185 years</strong>, longer than the ~80 years over which such a forest accumulates most of
        its carbon.
      </p>
    </SectionHeader>

    <div class="console panel ticks" use:reveal>
      <div class="controls">
        <div class="ctl">
          <div class="label">Land use</div>
          <div class="seg" role="group" aria-label="Land use">
            <button aria-pressed={kind === 'pv'} onclick={() => (kind = 'pv')}>PV field</button>
            <button aria-pressed={kind === 'forest'} onclick={() => (kind = 'forest')}>Afforestation</button>
          </div>
        </div>
        <div class="ctl">
          <div class="label">Climate zone</div>
          <div class="seg" role="group" aria-label="Climate zone">
            {#each zones as [z, l]}
              <button aria-pressed={zone === z} onclick={() => (zone = z)}>{l}</button>
            {/each}
          </div>
        </div>
        {#if kind === 'pv'}
          <div class="ctl">
            <div class="label">Electricity replaced</div>
            <div class="seg" role="group" aria-label="Replaced fossil fuel">
              {#each FUELS as f}
                <button aria-pressed={fuel === f} onclick={() => (fuel = f)}>{FUEL_LABEL[f]}</button>
              {/each}
            </div>
          </div>
        {:else if zone === 'drylands'}
          <div class="ctl">
            <div class="label">Dryland forest case</div>
            <div class="seg" role="group" aria-label="Dryland forest case">
              {#each Object.entries(FOREST_VARIANT_LABEL) as [v, l]}
                <button aria-pressed={forest === v} onclick={() => (forest = v as ForestVariant)}>{l}</button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="main">
        <div class="readout">
          <div class="bet" style:--acc={kind === 'pv' ? 'var(--lime)' : 'var(--amber)'}>
            <div class="label">Break-even time n</div>
            <div class="num v">
              {isDefault && !scenario.printedBet.startsWith('<') ? scenario.printedBet : fmtSig(r.bet, 3)}<span class="unit">years</span>
            </div>
            <div class="mono src">
              {scenario.label} · paper ({scenario.source}): <span class="c-text">{scenario.printedBet} yr</span>
              · model: <span class="c-text">{fmtSig(r.bet, 4)} yr</span>
              {#if !isDefault}<span class="mod">· modified</span>{/if}
            </div>
          </div>
          <div class="outs">
            <div class="o">
              <div class="label">{kind === 'pv' ? 'Emissions avoided (CES)' : 'Carbon absorbed by the forest'}</div>
              <div class="num c-lime">{fmt(r.ces, kind === 'pv' ? 1 : 2)}<span class="unit">kgC m⁻² yr⁻¹</span></div>
            </div>
            <div class="o">
              <div class="label">Carbon forcing RFc, one year</div>
              <div class="num c-cyan">−{sciParts(r.rfc)}<span class="unit">W m⁻²</span></div>
            </div>
            <div class="o">
              <div class="label">Albedo forcing RFr, global</div>
              <div class="num c-amber">{sciParts(r.rfrGlobal)}<span class="unit">W m⁻²</span></div>
            </div>
            <div class="o">
              <div class="label">Albedo forcing RFr, local</div>
              <div class="num c-amber">{fmt(r.rfrLocal, 2)}<span class="unit">W m⁻²</span></div>
            </div>
            <div class="o wide">
              <div class="label">
                Land to offset {EMISSION_TARGET_GTC} GtC yr⁻¹
                {#if kind === 'forest' && zone === 'drylands' && forest === 'drylandHigh' && isDefault}
                  <InfoTip
                    label="About this value"
                    text="The paper prints 26 Mkm² for this case. 6.6 GtC ÷ 0.28 kgC m⁻² gives 23.6 Mkm²; the printed 26 implies a sink of ≈0.254 kgC m⁻² yr⁻¹. See docs/reconciliation.md (C1)."
                  />
                {/if}
              </div>
              <div class="num c-text">{fmt(r.landMkm2, r.landMkm2 < 1 ? 2 : 1)}<span class="unit">million km²</span></div>
            </div>
          </div>
        </div>

        <div class="sliders">
          {#each visible as s (s.field)}
            {@const cal = calibrated.get(s.field)}
            {@const def = scenario.inputs[s.field]}
            <label class="sl" style:--accent="var(--{s.acc})">
              <span class="top">
                <span class="label">
                  <span class="sym">{s.sym}</span> · {s.label}
                  {#if cal}<InfoTip label="Calibrated value" text={cal.note} />{/if}
                </span>
                <span class="mono val">{fmt(inputs[s.field], s.dec)} <span class="u">{s.unit}</span></span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                bind:value={inputs[s.field]}
                style:--pct={pct(inputs[s.field], s.min, s.max)}
                style:--accent="var(--{s.acc})"
              />
              <span class="mono def">paper default {fmt(def, s.dec)}{cal ? ` (printed ${cal.printed})` : ''}</span>
            </label>
          {/each}
          <div class="actions">
            <button class="btn" onclick={() => (inputs = { ...scenario.inputs })} disabled={isDefault}>↺ Reset to paper</button>
          </div>
        </div>
      </div>

      <div class="chart">
        <div class="label">Share of albedo warming paid back (n·RFc ÷ RFr)</div>
        <BetRace {series} />
      </div>
    </div>

    <div class="below">
      <details class="hud" use:reveal>
        <summary>Step by step · your scenario</summary>
        <div class="inner trace mono">
          {#if kind === 'pv'}
            <div>CES = EPa · (CO2F − LCA) · 12/44 = {fmt(inputs.EPa, 1)} · ({fmt(inputs.co2f, 2)} − {fmt(inputs.lca, 3)}) · {C_PER_CO2.toFixed(4)} = <b>{fmt(r.ces, 2)}</b> kgC m⁻² yr⁻¹</div>
          {:else}
            <div>E = sink = <b>{fmt(r.ces, 2)}</b> kgC m⁻² yr⁻¹</div>
          {/if}
          <div>ΔC = E · AF / k = {fmt(r.ces, 2)} · {fmt(inputs.af, 2)} / {sciParts(K_KGC_PER_PPM)} = <b>{sciParts(r.dC, 3)}</b> ppm</div>
          <div>ν = a₁ΔC² + b₁|ΔC| + c₁N̄ + 5.36 = <b>{r.nu.toFixed(5)}</b> W m⁻²</div>
          <div>RFc = ν · ln(1 + ΔC/C₀), C₀ = {C0_PPM} ppm → <b>{sciParts(r.rfc, 3)}</b> W m⁻² (cooling)</div>
          <div>
            RFr = (Δα · Eg − {LW_ESCAPE_FRACTION} · RF_t) / A_E = ({fmt(inputs.dAlbedo, 3)} · {fmt(inputs.Eg, 0)} − {fmt(LW_ESCAPE_FRACTION * inputs.rfT, 2)}) / {sciParts(A_EARTH, 1)} = <b>{sciParts(r.rfrGlobal, 3)}</b> W m⁻²
          </div>
          <div>n = RFr / RFc = <b>{fmtSig(r.bet, 4)}</b> years</div>
        </div>
      </details>

      <details class="hud" use:reveal>
        <summary>The equations · Materials and methods</summary>
        <div class="inner eqs">
          <Equation tex={String.raw`n \cdot \mathrm{RF_c} = \mathrm{RF_r}`} label="M2" />
          <Equation tex={String.raw`\mathrm{RF_r} = \frac{\Delta\alpha\, E_g + 0.1\,\Delta L_{out}}{A_E}`} label="M3" />
          <Equation
            tex={String.raw`\mathrm{RF_C} = \left[a_1 (C-C_0)^2 + b_1 |C-C_0| + c_1 \bar N + 5.36\right] \ln\!\left(\frac{C}{C_0}\right)`}
            label="M4"
          />
          <Equation tex={String.raw`\mathrm{EP_a} = \frac{365 \cdot \mathrm{EP_d}}{A_{pv}} = \frac{365 \cdot 25{,}500}{75{,}600} \approx 123\ \mathrm{kWh\,m^{-2}\,yr^{-1}}`} label="M5" />
          <Equation tex={String.raw`\mathrm{CES} = \mathrm{EP_a}\,(\mathrm{CF} - \mathrm{LCA})`} label="M6" />
          <Equation tex={String.raw`\Delta C = \frac{E \cdot \mathrm{AF}}{k}`} />
          <p class="small">
            a₁ = −2.4 × 10⁻⁷ W m⁻² ppm⁻², b₁ = 7.2 × 10⁻⁴ W m⁻² ppm⁻¹, c₁ = −2.1 × 10⁻⁴ W m⁻² ppb⁻¹ (Etminan et al. 2016);
            C₀ = 409.85 ppm and N̄ = 331 ppb (2019 means, NOAA/GML); AF = 0.46; k = 2.16 × 10¹² kgC ppm⁻¹; A_E = 5.1 × 10¹⁴ m².
            Because ΔC is ~10⁻¹² ppm, the logarithm is evaluated as ln(1 + ΔC/C₀) to keep full precision (the original
            analysis used 120-bit arithmetic).
          </p>
        </div>
      </details>

      <details class="hud" use:reveal>
        <summary>Table 2 · fossil-fuel scenarios as printed</summary>
        <div class="inner table-scroll">
          <table class="hud">
            <thead>
              <tr><th scope="col"></th>{#each FUELS as f}<th scope="col">{FUEL_LABEL[f]}</th>{/each}<th scope="col">Afforestation</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">CO2F (kgCO₂ kWh⁻¹)</th>{#each FUELS as f}<td>{TABLE2.co2f[f]}</td>{/each}<td>N/A</td></tr>
              <tr><th scope="row">CF (kgC kWh⁻¹)</th>{#each FUELS as f}<td>{TABLE2.cf[f]}</td>{/each}<td>N/A</td></tr>
              <tr><th scope="row">LCA (kgC kWh⁻¹)</th><td colspan="4" class="center">{TABLE2.lca}</td><td>N/A</td></tr>
              <tr><th scope="row">CF − LCA (kgC kWh⁻¹)</th>{#each FUELS as f}<td>{TABLE2.cfMinusLca[f]}</td>{/each}<td>N/A</td></tr>
              <tr><th scope="row">CES or sink (kgC m⁻² yr⁻¹)</th>{#each FUELS as f}<td>{TABLE2.ces[f].toFixed(1)}</td>{/each}<td>0.15–0.28</td></tr>
              <tr><th scope="row">RFc (W m⁻² × 10⁻¹⁴)</th>{#each FUELS as f}<td>{TABLE2.rfc[f]}</td>{/each}<td>−4.12 × 10⁻²</td></tr>
              <tr><th scope="row">RFr local (W m⁻²)</th><td colspan="4" class="center">{TABLE2.rfrLocal.pv}</td><td>{TABLE2.rfrLocal.forest}</td></tr>
              <tr><th scope="row">RFr global (W m⁻² × 10⁻¹³)</th><td colspan="4" class="center">{TABLE2.rfrGlobal.pv}</td><td>{TABLE2.rfrGlobal.forest}</td></tr>
              <tr><th scope="row">Break-even time (years)</th>{#each FUELS as f}<td class="c-lime">{TABLE2.bet[f]}</td>{/each}<td class="c-amber">94–185</td></tr>
            </tbody>
          </table>
          <p class="small">
            CO₂ footprints from IEA for the 2005 fuel mix (the last year before renewables exceeded 1 %); C = CO₂ × 0.27.
            PV LCA incl. Li-ion storage: 0.095 kgCO₂ kWh⁻¹ (da Silva Lima et al. 2021). CES uses EPa = 123 kWh m⁻² yr⁻¹.
            The calculator reproduces every value at its defaults; see
            <a href="https://github.com/kebasaa/SolarVsForest/blob/main/docs/reconciliation.md" target="_blank" rel="noopener">how the printed numbers were reconciled with the code</a>.
          </p>
        </div>
      </details>
    </div>
  </div>
</section>

<style>
  .console {
    padding: clamp(14px, 2.4vw, 26px);
    display: grid;
    gap: 22px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 28px;
  }
  .ctl {
    display: grid;
    gap: 8px;
  }
  .main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(16px, 3vw, 40px);
  }
  .bet {
    border-left: 3px solid var(--acc);
    padding-left: 16px;
  }
  .bet .v {
    font-size: var(--step-4);
    line-height: 1.05;
    color: var(--acc);
    text-shadow: 0 0 32px color-mix(in srgb, var(--acc) 45%, transparent);
    margin-top: 6px;
  }
  .src {
    font-size: var(--step--2);
    color: var(--text-faint);
    margin-top: 6px;
  }
  .c-text {
    color: var(--text);
  }
  .mod {
    color: var(--amber);
  }
  .outs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    margin-top: 22px;
    background: var(--line);
    border: 1px solid var(--line);
  }
  .o {
    background: var(--panel-solid);
    padding: 10px 12px;
    min-width: 0;
    container-type: inline-size;
  }
  .o.wide {
    grid-column: 1 / -1;
  }
  /* the value is always shown in full (font scales with the cell); only the unit may be cut off */
  .o .num {
    display: flex;
    align-items: baseline;
    min-width: 0;
    font-size: clamp(0.72rem, 7cqw, 1.05rem);
    margin-top: 4px;
    white-space: nowrap;
  }
  .o .num :global(.unit) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sliders {
    display: grid;
    gap: 12px;
    align-content: start;
  }
  .sl {
    display: grid;
    gap: 2px;
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
  }
  .sym {
    color: var(--accent);
  }
  .val {
    color: var(--text);
    font-size: var(--step--1);
    white-space: nowrap;
  }
  .u {
    color: var(--text-faint);
    font-size: 0.85em;
  }
  .def {
    font-size: 10px;
    color: var(--text-faint);
  }
  .actions {
    display: flex;
    justify-content: flex-end;
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .chart {
    border-top: 1px solid var(--line);
    padding-top: 16px;
  }
  .chart .label {
    margin-bottom: 8px;
  }
  .below {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
  .trace {
    display: grid;
    gap: 8px;
    font-size: var(--step--2);
    color: var(--text-dim);
    overflow-x: auto;
  }
  .trace b {
    color: var(--lime);
    font-weight: 600;
  }
  .eqs {
    display: grid;
    gap: 6px;
  }
  .small {
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--text-faint);
    margin-top: 10px;
    max-width: none;
  }
  td.center {
    text-align: center;
  }
  @media (max-width: 900px) {
    .main {
      grid-template-columns: 1fr;
    }
  }
</style>
