<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import HudPhoto, { type Callout } from '../lib/components/HudPhoto.svelte';
  import Gallery from '../lib/components/Gallery.svelte';
  import { reveal } from '../lib/util/reveal';
  import { CAMPAIGNS } from '../lib/data/paper';

  const callouts: Callout[] = [
    {
      x: 0.33, y: 0.42, px: 0.08, py: 0.06, side: 'right',
      label: 'Mobile lab: 12-ton 4WD truck', value: 'EC + met',
      caption: 'air-conditioned instruments · UPS power', accent: 'cyan'
    },
    {
      x: 0.835, y: 0.56, px: 0.95, py: 0.2, side: 'left',
      label: 'Pneumatic mast, up to 35 m away', value: '2.7–5.2', unit: 'm',
      caption: 'sonic anemometer 0.63 m above mast top', accent: 'lime'
    }
  ];

  const instruments = [
    ['Sonic anemometer', 'Gill R3-100', '3D wind (u, v, w) and sonic temperature → H'],
    ['Gas analyser', 'LI-COR LI-7200, enclosed path', 'CO₂ and H₂O → LE'],
    ['Pyranometers', 'Kipp & Zonen CMP21', 'shortwave in / out → albedo'],
    ['Pyrgeometers', 'Kipp & Zonen CGR-4', 'longwave in / out → Lout, Ts'],
    ['Air T / RH', 'Campbell HMP45C', 'air temperature and humidity'],
    ['Processing', 'EddyPro 7.0.5 · Tovi 2.8.1', 'QC, tilt, density and spectral corrections']
  ];

  const galleryIds = [
    'mast-pv',
    'mast-pv-sensors',
    'mast-desert',
    'mast-pv-panels',
    'mast-pv-drone',
    'tower-forest',
    'tower-forest-work',
    'forest-canopy-nadir',
    'pv-rows',
    'pv-sunset',
    'forest-landscape'
  ];
  const captions: Record<string, string> = {
    'mast-pv': 'Mast in the PV field',
    'mast-pv-sensors': 'Sensor head',
    'mast-desert': 'Desert background',
    'mast-pv-panels': 'Above the panels',
    'mast-pv-drone': 'PV field at dusk',
    'tower-forest': 'Yatir flux tower',
    'tower-forest-work': 'Tower maintenance',
    'forest-canopy-nadir': 'Tower from above',
    'pv-rows': 'Panel rows',
    'pv-sunset': 'Arava sunrise',
    'forest-landscape': 'Yatir canopy'
  };
</script>

<section class="chapter" id="methods">
  <div class="wrap">
    <SectionHeader index="07" kicker="How we measured" title="A flux lab on wheels">
      <p>
        The surface energy fluxes come from <strong>eddy covariance</strong>: high-frequency measurements of vertical
        wind and temperature or humidity, whose covariance gives the turbulent transport of heat and water vapour. A mobile
        system on a truck measured the PV field and its desert background in three seasonal campaigns. At Yatir, a
        permanent tower has measured the forest since 2001.
      </p>
    </SectionHeader>

    <div use:reveal>
      <HudPhoto id="truck" {callouts} height="min(70vh, 600px)" sizes="(max-width: 1320px) 100vw, 1320px" />
    </div>

    <div class="grid">
      <div class="panel ticks block" use:reveal>
        <div class="label">Campaigns at Ketura</div>
        <ol class="timeline">
          {#each CAMPAIGNS as c, i}
            <li style:--d="{i * 120}ms">
              <div class="dot"></div>
              <div class="when display">{c.season} {c.year}</div>
              <div class="mono row"><span class="c-sand">Desert</span> {c.desert}</div>
              <div class="mono row"><span class="c-lime">PV field</span> {c.pv}</div>
              <div class="mono row dim">desert α {c.desertAlbedo.toFixed(2)}</div>
            </li>
          {/each}
        </ol>
        <p class="small">
          Full days only; &lt; 3 % of half-hours gap-filled. Desert sites next to Yatir were measured with the same system in
          2013–2016. Random flux error: ≈10 W m⁻² for H and 7 W m⁻² for LE.
        </p>
      </div>

      <div class="panel ticks block" use:reveal={{ delay: 100 }}>
        <div class="label">Instruments of the mobile system</div>
        <table class="hud inst">
          <tbody>
            {#each instruments as [what, model, purpose]}
              <tr>
                <th scope="row">{what}</th>
                <td><span class="model">{model}</span><span class="purpose">{purpose}</span></td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="small">
          Pyrgeometer readings were corrected for solar heating (ΔL = 0.38 + 0.01 Sin, Eq. M1). PV-panel thermal data came
          from drone thermography with a deep-learning segmentation of panels, sunlit soil and shade.
        </p>
      </div>
    </div>

    <div class="gal" use:reveal>
      <div class="label gl">Field gallery · Photos: Jonathan D. Müller</div>
      <Gallery ids={galleryIds} {captions} />
    </div>
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 14px;
    margin-top: 14px;
  }
  .block {
    padding: 18px;
  }
  .timeline {
    list-style: none;
    margin: 18px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    position: relative;
  }
  .timeline::before {
    content: '';
    position: absolute;
    top: 5px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--lime), var(--amber));
    opacity: 0.6;
  }
  .timeline li {
    position: relative;
    padding-top: 20px;
  }
  .dot {
    position: absolute;
    top: 0;
    left: 0;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: var(--bg-1);
    border: 2px solid var(--lime);
    box-shadow: var(--glow-lime);
  }
  .when {
    font-size: var(--step--1);
    margin-bottom: 6px;
  }
  .row {
    font-size: var(--step--2);
    color: var(--text-dim);
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .dim {
    color: var(--text-faint);
  }
  .small {
    font-size: var(--step--2);
    font-family: var(--font-mono);
    color: var(--text-faint);
    margin: 16px 0 0;
  }
  .inst {
    margin-top: 10px;
  }
  .inst th {
    font-weight: 400;
    color: var(--text);
    vertical-align: top;
  }
  .inst td {
    text-align: left;
    white-space: normal;
  }
  .model {
    display: block;
    color: var(--cyan);
  }
  .purpose {
    display: block;
    color: var(--text-faint);
    font-size: 0.9em;
  }
  .gal {
    margin-top: 28px;
  }
  .gl {
    margin-bottom: 10px;
  }
  @media (max-width: 960px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 520px) {
    .timeline {
      grid-template-columns: 1fr;
    }
    .timeline::before {
      display: none;
    }
  }
</style>
