<script lang="ts" module>
  export interface RaceSeries {
    id: string;
    label: string;
    /** break-even time in years: n·RFc/RFr reaches 100 % at n = bet */
    bet: number;
    color: string;
    emphasis?: boolean;
  }
</script>

<script lang="ts">
  /**
   * "Race" chart: share of the albedo warming (RFr) paid back by n years of carbon
   * benefit, n·RFc / RFr, on a log time axis. Each series hits 100 % at its BET.
   */
  import { scaleLinear, scaleLog } from 'd3-scale';
  import { line } from 'd3-shape';
  import { FOREST_ACCUMULATION_YEARS } from '../model/constants';
  import { fmt, fmtSig } from '../util/format';

  interface Props {
    series: RaceSeries[];
  }
  let { series }: Props = $props();

  let w = $state(720);
  const h = $derived(w < 560 ? 300 : 380);
  const m = $derived({ t: 24, r: w < 560 ? 12 : 24, b: 42, l: w < 560 ? 40 : 52 });

  const X0 = 0.1;
  const X1 = 1000;
  const x = $derived(scaleLog().domain([X0, X1]).range([m.l, w - m.r]).clamp(true));
  const y = $derived(scaleLinear().domain([0, 1.25]).range([h - m.b, m.t]));

  const samples = Array.from({ length: 161 }, (_, i) => X0 * Math.pow(X1 / X0, i / 160));

  function pathFor(bet: number) {
    const pts = samples.filter((n) => n / bet <= 1.25).map((n) => [n, n / bet] as [number, number]);
    // add exact end at the top of the chart
    if (bet * 1.25 <= X1) pts.push([bet * 1.25, 1.25]);
    return line<[number, number]>()
      .x((d) => x(d[0]))
      .y((d) => y(d[1]))(pts) ?? '';
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
</script>

<div class="race" bind:clientWidth={w}>
  <svg
    width={w}
    height={h}
    viewBox="0 0 {w} {h}"
    role="img"
    aria-label="Share of albedo warming offset over time. {series.map((s) => `${s.label}: break-even after ${fmtSig(s.bet, 2)} years`).join('; ')}."
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
    <rect x={m.l} y={y(1.25)} width={w - m.l - m.r} height={y(1) - y(1.25)} fill="rgba(184,255,90,0.045)" />
    <text x={w - m.r - 6} y={y(1.25) + 14} text-anchor="end" class="zone lime">NET COOLING</text>
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
    <text x={m.l + 6} y={y(1) - 6} class="zone">BREAK-EVEN · n·RFc = RFr</text>

    <!-- forest accumulation period -->
    <line x1={x(FOREST_ACCUMULATION_YEARS)} x2={x(FOREST_ACCUMULATION_YEARS)} y1={m.t} y2={h - m.b} class="horizon" />
    <text x={x(FOREST_ACCUMULATION_YEARS) - 5} y={m.t + 26} text-anchor="end" class="zone">80 YR FOREST C-ACCUMULATION</text>

    <!-- series -->
    {#each sorted as s (s.id)}
      <path
        d={pathFor(s.bet)}
        fill="none"
        stroke={s.color}
        stroke-width={s.emphasis ? 3 : 1.4}
        stroke-opacity={s.emphasis ? 1 : 0.55}
        filter={s.emphasis ? 'url(#race-glow)' : undefined}
      />
      {#if s.bet >= X0 && s.bet <= X1}
        <circle cx={x(s.bet)} cy={y(1)} r={s.emphasis ? 5.5 : 3.5} fill={s.emphasis ? s.color : 'var(--bg-1)'} stroke={s.color} stroke-width="1.5" />
      {/if}
    {/each}

    <!-- labels for non-emphasised series -->
    {#each series.filter((s) => !s.emphasis && s.bet >= X0 && s.bet <= X1) as s, i}
      <text x={x(s.bet) + 6} y={y(1) + 16 + (i % 3) * 12} class="slabel" fill={s.color}>{s.label}</text>
    {/each}

    {#if focusSeries && focusSeries.bet >= X0 && focusSeries.bet <= X1}
      <g transform="translate({x(focusSeries.bet)},{y(1)})">
        <line y1="0" y2={h - m.b - y(1)} class="drop" stroke={focusSeries.color} />
        <rect x="-46" y="-40" width="92" height="26" rx="2" class="flag" stroke={focusSeries.color} />
        <text y="-22" text-anchor="middle" class="flagt" fill={focusSeries.color}>{fmtSig(focusSeries.bet, 3)} yr</text>
      </g>
    {/if}

    <!-- hover crosshair -->
    {#if hoverN !== null}
      <line x1={x(hoverN)} x2={x(hoverN)} y1={m.t} y2={h - m.b} class="cross" />
      <g transform="translate({Math.min(x(hoverN) + 8, w - m.r - 170)},{m.t + 34})">
        <rect width="168" height={20 + series.length * 14} class="tip" />
        <text x="8" y="15" class="tipt">YEAR {fmtSig(hoverN, 2)}</text>
        {#each series as s, i}
          <text x="8" y={30 + i * 14} class="tipv" fill={s.color}>
            {s.label.slice(0, 14).padEnd(14, ' ')} {fmt(Math.min(999, (hoverN / s.bet) * 100), 0)}%
          </text>
        {/each}
      </g>
    {/if}
  </svg>
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
    font-size: 9.5px;
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
</style>
