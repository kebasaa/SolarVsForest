<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import Picture from '../lib/components/Picture.svelte';
  import { reveal } from '../lib/util/reveal';
  import { SITES } from '../lib/data/paper';
  import { EPA_KETURA } from '../lib/model/constants';
  import { fmt } from '../lib/util/format';

  const sites = [
    {
      key: 'A',
      photo: 'pv-context',
      name: ['Ketura', 'PV field'],
      region: SITES.ketura.region,
      climate: 'Hyper-arid · aridity index < 0.03',
      acc: 'lime',
      coord: '≈ 29.97° N · 35.06° E',
      facts: [
        ['Area', '75,600', 'm²'],
        ['Capacity', '4.9', 'MW'],
        ['Panel cover', '43', '%'],
        ['Tilt', '30', '° south'],
        ['Rain', '28', 'mm yr⁻¹'],
        ['Irradiance', '2,122', 'kWh m⁻² yr⁻¹'],
        ['Mean temp.', '23.9', '°C'],
        ['Electricity', fmt(EPA_KETURA, 0), 'kWh m⁻² yr⁻¹']
      ],
      text: 'Fixed rows of monofacial crystalline-silicon panels. 84 % of the field is panel rows (51 % panels, 49 % soil between them); roads and buildings take the remaining 16 %.'
    },
    {
      key: 'B',
      photo: 'forest-aerial',
      name: ['Yatir', 'forest'],
      region: SITES.yatir.region,
      climate: 'Semi-arid · dry Mediterranean',
      acc: 'pine',
      coord: '31°20′49″ N · 35°03′07″ E',
      facts: [
        ['Area', '2,800', 'ha'],
        ['Species', 'Aleppo pine', ''],
        ['Height', '~10', 'm'],
        ['Canopy cover', '50', '%'],
        ['Altitude', '600–850', 'm'],
        ['Flux tower', 'since 2001', ''],
        ['Carbon absorbed', '0.15', 'kgC m⁻² yr⁻¹'],
        ['Albedo', '0.12', 'annual']
      ],
      text: 'A planted Pinus halepensis forest at the northern edge of the Negev desert, monitored with a permanent eddy-covariance tower. Its surroundings are open shrubland, the "desert background".'
    }
  ] as const;
</script>

<section class="chapter" id="sites">
  <div class="wrap">
    <SectionHeader index="02" kicker="Field sites" title="Two sites, one desert">
      <p>
        We compared both land-use changes against the desert they replaced, at two sites in southern Israel. For each one we
        measured the surface energy balance of the new surface <em>and</em> of the undisturbed desert next to it.
      </p>
    </SectionHeader>

    <div class="grid">
      {#each sites as s, i}
        <article class="site panel ticks" use:reveal={{ delay: i * 150 }} style:--acc="var(--{s.acc})">
          <div class="photo">
            <Picture id={s.photo} cover sizes="(max-width: 900px) 100vw, 640px" />
            <div class="ov">
              <div class="label tag">Site {s.key} · {s.region}</div>
              <h3 class="display">{s.name[0]} {s.name[1]}<span class="dot">.</span></h3>
            </div>
            <div class="coord label">{s.coord}</div>
          </div>
          <div class="body">
            <div class="label clim">{s.climate}</div>
            <dl class="facts">
              {#each s.facts as [k, v, u]}
                <div class="fact">
                  <dt class="label">{k}</dt>
                  <dd><span class="num">{v}</span>{#if u}<span class="unit">{u}</span>{/if}</dd>
                </div>
              {/each}
            </dl>
            <p>{s.text}</p>
          </div>
        </article>
      {/each}
    </div>

    <p class="note" use:reveal>
      For a global perspective, the paper adds flux sites with forest and grassland in a <strong>temperate</strong> zone
      (Germany: DE-Gri, DE-Hzd) and a <strong>tropical</strong> zone (Panama: PA-SPn, PA-SPs), together with PV fields
      from the Global Power Plant Database (see <a href="#zones">climate zones</a>).
    </p>
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .site {
    overflow: hidden;
    border-top: 2px solid var(--acc);
  }
  .photo {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
  }
  .photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(5, 14, 11, 0.85));
  }
  .ov {
    position: absolute;
    left: 18px;
    bottom: 16px;
    z-index: 1;
  }
  .tag {
    color: var(--text-dim);
  }
  .ov h3 {
    font-size: var(--step-2);
    margin-top: 6px;
  }
  .dot {
    color: var(--acc);
  }
  .coord {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
    padding: 4px 8px;
    background: rgba(5, 14, 11, 0.7);
    border: 1px solid var(--line);
    color: var(--acc);
  }
  .body {
    padding: 18px;
    container-type: inline-size;
  }
  .clim {
    color: var(--acc);
    margin-bottom: 14px;
  }
  .facts {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    margin: 0 0 16px;
    background: var(--line);
    border: 1px solid var(--line);
  }
  .fact {
    background: var(--panel-solid);
    padding: 10px 10px;
    container-type: inline-size;
    min-width: 0;
  }
  /* the value is always shown in full (font scales with the cell); only the unit may be cut off */
  dd {
    display: flex;
    align-items: baseline;
    min-width: 0;
    margin: 4px 0 0;
    font-size: clamp(0.72rem, 10.5cqw, 1.05rem);
    color: var(--text);
    white-space: nowrap;
  }
  dd .num {
    flex: none;
  }
  dd .unit {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.62em;
  }
  .body p {
    font-size: var(--step--1);
    margin: 0;
  }
  .note {
    margin-top: 22px;
    font-size: var(--step--1);
  }
  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
  /* four columns only when the card is wide enough for readable values */
  @container (max-width: 600px) {
    .facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
