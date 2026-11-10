<script lang="ts" module>
  export interface RaceSeries {
    id: string;
    label: string;
    /** break-even time in years: n·RFc/RFr reaches 100 % at n = bet */
    bet: number;
    /** optional lower break-even time; the series is then drawn as a band from betLow to bet */
    betLow?: number;
    /** legend text for the break-even time (e.g. the value as printed in the paper) */
    betLabel?: string;
    color: string;
    /** SVG stroke-dasharray, e.g. '6 3' */
    dash?: string;
    /** label the series directly where it crosses break-even */
    direct?: boolean;
    /** highlighted series (the calculator's current scenario) */
    emphasis?: boolean;
    /** legend group heading */
    group?: string;
  }
</script>

<script lang="ts">
  /**
   * "Race" chart: share of the albedo warming (RFr) paid back by n years of carbon
   * benefit, n·RFc / RFr, on a log time axis. Each series hits 100 % at its BET.
   */
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { area, line } from 'd3-shape';
  import { FOREST_ACCUMULATION_YEARS } from '../model/constants';
  import { fmt, fmtSig } from '../util/format';

  interface Props {
    series: RaceSeries[];
  }
  let { series }: Props = $props();

  let w = $state(720);
  const h = $derived(w < 560 ? 320 : 400);
  const m = $derived({ t: 24, r: w < 560 ? 12 : 24, b: 42, l: w < 560 ? 40 : 52 });

  const X0 = 0.1;
  const X1 = 1000;
  const YMAX = 1.25;
  const x = $derived(scaleLog().domain([X0, X1]).range([m.l, w - m.r]).clamp(true));
  const y = $derived(scaleLinear().domain([0, YMAX]).range([h - m.b, m.t]));

  const samples = Array.from({ length: 201 }, (_, i) => X0 * Math.pow(X1 / X0, i / 200));

  function pathFor(bet: number) {
    const pts = samples.filter((n) => n / bet <= YMAX).map((n) => [n, n / bet] as [number, number]);
    if (bet * YMAX <= X1) pts.push([bet * YMAX, YMAX]);
    return line<[number, number]>()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))(pts) ?? '';
  }

  /** area between the curves of betLow (faster, upper edge) and bet (slower, lower edge) */
  function bandFor(betLow: number, bet: number) {
    const ns = samples.filter((n) => n / bet <= YMAX);
    if (bet * YMAX <= X1) ns.push(bet * YMAX);
    return area<number>()
      .x((n) => x(n))
      .y0((n) => y(Math.min(n / bet, YMAX)))
      .y1((n) => y(Math.min(n / betLow, YMAX)))(ns) ?? '';
  }

  const xticks = [0.1, 1, 10, 100, 1000];
  const yticks = [0, 0.25, 0.5, 0.75, 1, 1.25];

  let hoverN = $state<number | null>(null);
  function onMove(e: PointerEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * w;
    if (px < m.l || px > w - m.r) {
      hoverN = null;
      return;
    }
    hoverN = x.invert(px);
  }

  const sorted = $derived([...series].sort((a, b) => Number(!!a.emphasis) - Number(!!b.emphasis)));
  const focusSeries = $derived(series.find((s) => s.emphasis));
  // narrow charts rely on the legend instead of in-chart text labels
  const narrow = $derived(w < 560);
  const directs = $derived(narrow ? [] : series.filter((s) => s.direct && !s.emphasis && s.bet >= X0 && s.bet <= X1));
  const groups = $derived(
    [...new Set(series.filter((s) => s.group).map((s) => s.group!))].map((g) => ({
      name: g,
      items: series.filter((s) => s.group === g)
    }))
  );

  const pct = (n: number, bet: number) => fmt(Math.min(999, (n / bet) * 100), 0);
  const betText = (s: RaceSeries) =>
    s.betLabel ??
    (s.betLow ? `${fmtSig(s.betLow, 2)}–${fmtSig(s.bet, 3)} yr` : `${fmtSig(s.bet, s.bet < 10 ? 2 : 3)} yr`);
  const TIP_W = 196;
</script>

<div class="race" bind:clientWidth={w}>
  <svg
    width={w}
    height={h}
    viewBox="0 0 {w} {h}"
    role="img"
    aria-label="Share of albedo warming offset over time. {series.map((s) => `${s.label}: break-even after ${betText(s)}`).join('; ')}."
    onpointermove={onMove}
    onpointerleave={() => (hoverN = null)}
  >
    <defs>
      <filter id="race-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    <!-- net warming / cooling zones -->
    <rect x={m.l} y={y(1)} width={w - m.l - m.r} height={y(0) - y(1)} fill="rgba(255,179,71,0.035)" />
    <rect x={m.l} y={y(YMAX)} width={w - m.l - m.r} height={y(1) - y(YMAX)} fill="rgba(184,255,90,0.045)" />
    <text x={w - m.r - 6} y={y(YMAX) + 14} text-anchor="end" class="zone lime">NET COOLING</text>
    <text x={w - m.r - 6} y={y(0) - 8} text-anchor="end" class="zone amber">NET WARMING</text>

    <!-- grid -->
    {#each xticks as t}
      <line x1={x(t)} x2={x(t)} y1={m.t} y2={h - m.b} class="grid" />
      <text x={x(t)} y={h - m.b + 18} text-anchor="middle" class="tick">{t < 1 ? t : fmt(t)}</text>
    {/each}
    {#each yticks as t}
      <line x1={m.l} x2={w - m.r} y1={y(t)} y2={y(t)} class="grid" />
      <text x={m.l - 8} y={y(t) + 4} text-anchor="end" class="tick">{t * 100}%</text>
    {/each}
    <text x={(m.l + w - m.r) / 2} y={h - 4} text-anchor="middle" class="axis">YEARS AFTER LAND-USE CHANGE (LOG SCALE)</text>

    <!-- break-even line -->
    <line x1={m.l} x2={w - m.r} y1={y(1)} y2={y(1)} class="be" />
    {#if !narrow}<text x={m.l + 6} y={y(1) - 6} class="zone">BREAK-EVEN · n·RFc = RFr</text>{/if}

    <!-- forest accumulation period -->
    <line x1={x(FOREST_ACCUMULATION_YEARS)} x2={x(FOREST_ACCUMULATION_YEARS)} y1={m.t} y2={h - m.b} class="horizon" />
    <text x={x(FOREST_ACCUMULATION_YEARS) - 5} y={narrow ? m.t + 34 : m.t + 26} text-anchor="end" class="zone">{narrow ? "80 YR" : "80 YR FOREST C-ACCUMULATION"}</text>

    <!-- series -->
    {#each sorted as s (s.id)}
      {#if s.betLow}
        <path d={bandFor(s.betLow, s.bet)} fill={s.color} fill-opacity="0.16" stroke="none" />
        <path d={pathFor(s.betLow)} fill="none" stroke={s.color} stroke-width="1.2" stroke-opacity="0.7" stroke-dasharray={s.dash} />
      {/if}
      <path
        d={pathFor(s.bet)}
        fill="none"
        stroke={s.color}
        stroke-width={s.emphasis ? 3 : 1.6}
        stroke-opacity={s.emphasis ? 1 : 0.85}
        stroke-dasharray={s.emphasis ? undefined : s.dash}
        filter={s.emphasis ? 'url(#race-glow)' : undefined}
      />
      {#each s.betLow ? [s.betLow, s.bet] : [s.bet] as b}
        {#if b >= X0 && b <= X1}
          <circle cx={x(b)} cy={y(1)} r={s.emphasis ? 5.5 : 3.5} fill={s.emphasis ? s.color : 'var(--bg-1)'} stroke={s.color} stroke-width="1.5" />
        {/if}
      {/each}
    {/each}

    <!-- direct labels (alternating below / above the break-even line to avoid overlaps) -->
    {#each directs as s, i}
      {@const below = i % 2 === 0}
      <text
        x={x(s.bet) + (below ? 6 : -6)}
        y={below ? y(1) + 18 : y(1) - 10}
        text-anchor={below ? 'start' : 'end'}
        class="slabel"
        fill={s.color}>{s.label}</text
      >
    {/each}

    {#if focusSeries && focusSeries.bet >= X0 && focusSeries.bet <= X1}
      <g transform="translate({x(focusSeries.bet)},{y(1)})">
        <line y1="0" y2={h - m.b - y(1)} class="drop" stroke={focusSeries.color} />
        <rect x="-46" y="-40" width="92" height="26" rx="2" class="flag" stroke={focusSeries.color} />
        <text y="-22" text-anchor="middle" class="flagt" fill={focusSeries.color}>{betText(focusSeries)}</text>
      </g>
    {/if}

    <!-- hover crosshair -->
    {#if hoverN !== null}
      <line x1={x(hoverN)} x2={x(hoverN)} y1={m.t} y2={h - m.b} class="cross" />
      <g transform="translate({Math.min(x(hoverN) + 8, w - m.r - TIP_W)},{m.t + 34})">
        <rect width={TIP_W} height={20 + series.length * 14} class="tip" />
        <text x="8" y="15" class="tipt">YEAR {fmtSig(hoverN, 2)}</text>
        {#each series as s, i}
          <text x="8" y={30 + i * 14} class="tipv" fill={s.color}>
            {s.label.slice(0, 18).padEnd(18, ' ')} {s.betLow ? `${pct(hoverN, s.bet)}–${pct(hoverN, s.betLow)}` : pct(hoverN, s.bet)}%
          </text>
        {/each}
      </g>
    {/if}
  </svg>

  {#if groups.length}
    <div class="legend">
      {#each groups as g}
        <div class="lgroup">
          <div class="label">{g.name}</div>
          <ul>
            {#each g.items as s}
              <li>
                <svg width="30" height="12" aria-hidden="true">
                  {#if s.betLow}<rect x="0" y="2" width="30" height="8" fill={s.color} fill-opacity="0.2" />{/if}
                  <line x1="0" x2="30" y1="6" y2="6" stroke={s.color} stroke-width={s.emphasis ? 3 : 2} stroke-dasharray={s.emphasis ? undefined : s.dash} />
                </svg>
                <span class="ln">{s.label}</span>
                <span class="mono lv" style:color={s.color}>{betText(s)}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .race {
    width: 100%;
    touch-action: pan-y;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .grid {
    stroke: var(--grid);
    stroke-width: 1;
  }
  .tick {
    font-family: var(--font-mono);
    font-size: 10px;
    fill: var(--text-faint);
  }
  .axis,
  .zone {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.12em;
    fill: var(--text-faint);
  }
  .zone.lime {
    fill: var(--lime);
    opacity: 0.7;
  }
  .zone.amber {
    fill: var(--amber);
    opacity: 0.7;
  }
  .be {
    stroke: var(--text-dim);
    stroke-dasharray: 6 4;
  }
  .horizon {
    stroke: var(--pine);
    stroke-opacity: 0.5;
    stroke-dasharray: 2 4;
  }
  .slabel {
    font-family: var(--font-mono);
    font-size: 10px;
  }
  .drop {
    stroke-dasharray: 3 3;
    stroke-opacity: 0.7;
  }
  .flag {
    fill: rgba(5, 14, 11, 0.9);
  }
  .flagt {
    font-family: var(--font-display);
    font-size: 12px;
  }
  .cross {
    stroke: var(--text-dim);
    stroke-opacity: 0.5;
  }
  .tip {
    fill: rgba(5, 14, 11, 0.92);
    stroke: var(--line-strong);
  }
  .tipt {
    font-family: var(--font-mono);
    font-size: 10px;
    fill: var(--text);
    letter-spacing: 0.1em;
  }
  .tipv {
    font-family: var(--font-mono);
    font-size: 10px;
    white-space: pre;
  }
  .legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 10px 24px;
    margin-top: 12px;
  }
  .lgroup ul {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }
  .lgroup li {
    display: grid;
    grid-template-columns: 30px 1fr auto;
    align-items: center;
    gap: 10px;
    font-size: var(--step--1);
    color: var(--text-dim);
  }
  .lv {
    font-size: var(--step--2);
    white-space: nowrap;
  }
</style>
