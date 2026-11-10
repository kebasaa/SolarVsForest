<script lang="ts">
  import SectionHeader from '../lib/components/SectionHeader.svelte';
  import Picture from '../lib/components/Picture.svelte';
  import { reveal } from '../lib/util/reveal';

  const points = [
    {
      acc: 'pine',
      title: 'Forests do things PV cannot',
      text: 'Biodiversity, soil protection, wood, recreation, tourism, health and cultural value. Forests also actively remove carbon emitted in the past and can store it long-term in biomass and soil.'
    },
    {
      acc: 'cyan',
      title: 'Local cooling is real',
      text: 'Afforestation is far better at dissipating heat and cooling its own surface (~7 °C at Yatir). PV left the midday surface temperature unchanged.'
    },
    {
      acc: 'amber',
      title: 'PV has its own footprint',
      text: 'Large PV fields can cause soil erosion, dust, habitat loss and pollution, and clearing background vegetation emits carbon. Because PV needs far less land, these impacts stay comparatively small. Some dryland afforestation harms biodiversity too.'
    },
    {
      acc: 'lime',
      title: 'Complementary, by climate zone',
      text: 'The paper argues for combining strategies: emission reduction by PV in drylands, and carbon removal into biomass in temperate and tropical zones where forests grow well.'
    }
  ];
</script>

<section class="chapter" id="caveats">
  <div class="wrap">
    <div class="layout">
      <div>
        <SectionHeader index="08" kicker="Beyond the numbers" title="Not one or the other">
          <p>
            This is a purely climatic, radiative-forcing view. From that perspective the result is unambiguous: in drylands,
            PV fields mitigate climate change far more efficiently per square metre than afforestation. But that is not the
            whole picture.
          </p>
        </SectionHeader>
        <div class="pts">
          {#each points as p, i}
            <article class="pt panel ticks" style:--acc="var(--{p.acc})" use:reveal={{ delay: i * 80 }}>
              <h3 class="display">{p.title}</h3>
              <p>{p.text}</p>
            </article>
          {/each}
        </div>
      </div>
      <div class="photo" use:reveal={{ delay: 120 }}>
        <Picture id="forest-landscape" cover sizes="(max-width: 960px) 100vw, 520px" />
        <div class="quote panel">
          <div class="label">From the abstract</div>
          <p>
            “Both approaches must be combined and complementary, depending on climate zone.”
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: clamp(20px, 4vw, 48px);
    align-items: stretch;
  }
  .pts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .pt {
    padding: 18px;
    border-left: 2px solid var(--acc);
  }
  .pt h3 {
    font-size: var(--step--1);
    line-height: 1.35;
    color: var(--acc);
    margin-bottom: 8px;
  }
  .pt p {
    font-size: var(--step--1);
    margin: 0;
  }
  .photo {
    position: relative;
    min-height: 420px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .quote {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    padding: 16px;
    background: rgba(5, 14, 11, 0.8);
  }
  .quote p {
    margin: 8px 0 0;
    font-size: var(--step-0);
    color: var(--text);
    line-height: 1.5;
  }
  @media (max-width: 960px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .pts {
      grid-template-columns: 1fr;
    }
  }
</style>
