<script lang="ts">
  import Nav from './sections/Nav.svelte';
  import Hero from './sections/Hero.svelte';
  import Question from './sections/Question.svelte';
  import Sites from './sections/Sites.svelte';
  import Albedo from './sections/Albedo.svelte';
  import EnergyBalance from './sections/EnergyBalance.svelte';
  import BreakEven from './sections/BreakEven.svelte';
  import Zones from './sections/Zones.svelte';
  import Methods from './sections/Methods.svelte';
  import Caveats from './sections/Caveats.svelte';
  import Footer from './sections/Footer.svelte';
</script>

<a class="skip" href="#question">Skip to content</a>
<Nav />
<main>
  <Hero />
  <Question />
  <Sites />
  <Albedo />
  <EnergyBalance />
  <BreakEven />
  <Zones />
  <Methods />
  <Caveats />
</main>
<Footer />

<style>
  .skip {
    position: absolute;
    left: -9999px;
    top: 8px;
    z-index: 100;
    padding: 8px 12px;
    background: var(--bg-1);
    border: 1px solid var(--lime);
  }
  .skip:focus {
    left: 8px;
  }
</style>
