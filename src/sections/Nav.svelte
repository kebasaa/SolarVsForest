<script lang="ts">
  import { PAPER } from '../lib/data/paper';

  const links = [
    ['question', 'Question'],
    ['sites', 'Sites'],
    ['albedo', 'Albedo'],
    ['energy', 'Energy'],
    ['break-even', 'Break-even'],
    ['zones', 'Zones'],
    ['methods', 'Methods']
  ] as const;

  let progress = $state(0);
  let active = $state('');
  let scrolled = $state(false);

  $effect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      progress = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      scrolled = h.scrollTop > 40;
      const mid = window.innerHeight * 0.4;
      let current = '';
      for (const [id] of links) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) current = id;
      }
      active = current;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  });
</script>

<nav class="nav" class:scrolled aria-label="Sections">
  <div class="inner">
    <a class="brand" href="#top" aria-label="Back to top">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 22h20M9 22l3-9h8l3 9" stroke="var(--lime)" stroke-width="2" fill="none" />
        <circle cx="16" cy="8" r="3" fill="var(--amber)" />
      </svg>
      <span class="display">Solar vs Forest<span class="dot">.</span></span>
    </a>
    <ul>
      {#each links as [id, label]}
        <li><a href="#{id}" class:active={active === id} aria-current={active === id ? 'true' : undefined}>{label}</a></li>
      {/each}
    </ul>
    <a class="paper" href={PAPER.url} target="_blank" rel="noopener">Paper ↗</a>
  </div>
  <div class="bar" style:transform="scaleX({progress})"></div>
</nav>

<style>
  .nav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    height: var(--nav-h);
    transition: background 0.3s, border-color 0.3s;
    border-bottom: 1px solid transparent;
  }
  .nav.scrolled {
    background: rgba(5, 14, 11, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom-color: var(--line);
  }
  .inner {
    height: 100%;
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 0 var(--gutter);
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text);
    font-size: 0.8rem;
    white-space: nowrap;
  }
  .dot {
    color: var(--lime);
  }
  ul {
    list-style: none;
    margin: 0 0 0 auto;
    padding: 0;
    display: flex;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  ul::-webkit-scrollbar {
    display: none;
  }
  ul a,
  .paper {
    display: block;
    padding: 6px 10px;
    font-family: var(--font-mono);
    font-size: var(--step--2);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: 2px;
    white-space: nowrap;
  }
  ul a:hover {
    color: var(--text);
  }
  ul a.active {
    color: var(--lime);
    border-color: rgba(184, 255, 90, 0.35);
    background: rgba(184, 255, 90, 0.07);
  }
  .paper {
    border-color: var(--line-strong);
    color: var(--text);
  }
  .paper:hover {
    border-color: var(--lime);
    color: var(--lime);
  }
  .bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 2px;
    background: linear-gradient(90deg, var(--lime), var(--amber));
    transform-origin: 0 50%;
    box-shadow: var(--glow-lime);
  }
  @media (max-width: 980px) {
    ul {
      display: none;
    }
    .paper {
      margin-left: auto;
    }
  }
</style>
