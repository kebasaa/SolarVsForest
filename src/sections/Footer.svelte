<script lang="ts">
  import { BIBTEX, PAPER } from '../lib/data/paper';

  let copied = $state(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      copied = false;
    }
  }
  const year = new Date().getFullYear();
</script>

<footer class="foot" id="cite">
  <div class="wrap">
    <div class="grid">
      <div class="cite panel ticks">
        <div class="label">Cite the paper</div>
        <p class="ref">
          Stern R.*, Muller J. D.*, Rotenberg E., Amer M., Segev L., Yakir D. ({PAPER.year}).
          <strong>{PAPER.title}.</strong>
          <em>{PAPER.journal}</em> {PAPER.volume}({PAPER.issue}), {PAPER.articleId}.
          <a href="https://doi.org/{PAPER.doi}" target="_blank" rel="noopener">doi:{PAPER.doi}</a>
        </p>
        <p class="eq label">* equal contribution · Weizmann Institute of Science, Rehovot, Israel</p>
        <details class="hud">
          <summary>BibTeX</summary>
          <div class="inner">
            <pre>{BIBTEX}</pre>
            <button class="btn" onclick={copy}>{copied ? 'Copied ✓' : 'Copy BibTeX'}</button>
          </div>
        </details>
      </div>

      <div class="links">
        <div class="label">Links</div>
        <ul>
          <li><a href={PAPER.url} target="_blank" rel="noopener">Paper (open access) ↗</a></li>
          <li><a href={PAPER.code} target="_blank" rel="noopener">Analysis code (Python) ↗</a></li>
          <li><a href={PAPER.data} target="_blank" rel="noopener">Flux data, Israeli sites ↗</a></li>
          <li><a href="https://github.com/kebasaa/SolarVsForest" target="_blank" rel="noopener">Source of this website ↗</a></li>
        </ul>
        <div class="label fund">Funding</div>
        <p class="small">
          Jewish National Fund-KKL, Minerva Foundation, Israel Science Foundation, the Yotam project, the Weizmann Institute
          Sustainability and Energy Research Initiative, and the Society of the Swiss Friends of the Weizmann Institute.
        </p>
      </div>

      <div class="lic">
        <div class="label">Licences</div>
        <ul class="small">
          <li><strong>Website code</strong>: <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GNU GPL v3</a></li>
          <li><strong>Photos</strong>: © Jonathan D. Müller, <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener">CC BY-NC 4.0</a></li>
          <li><strong>Paper, figures and tables</strong>: © the authors, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>, published by Oxford University Press on behalf of the National Academy of Sciences</li>
        </ul>
        <p class="small">
          All numbers on this site are taken from the paper. The interactive model is a port of the published notebooks; at
          its defaults it reproduces the values printed in Tables 2 and 3.
        </p>
      </div>
    </div>
    <div class="bottom label">
      <span>Solar vs Forest<span class="c-lime">.</span> · {year}</span>
      <a href="#top">Back to top ↑</a>
    </div>
  </div>
</footer>

<style>
  .foot {
    border-top: 1px solid var(--line);
    background: linear-gradient(180deg, rgba(5, 14, 11, 0.4), var(--bg-0));
    padding: clamp(48px, 7vw, 96px) 0 28px;
  }
  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.8fr) minmax(0, 0.9fr);
    gap: clamp(20px, 3vw, 40px);
  }
  .cite {
    padding: 20px;
  }
  .ref {
    margin: 12px 0 8px;
    font-size: var(--step--1);
    color: var(--text-dim);
  }
  .ref strong {
    color: var(--text);
  }
  .eq {
    margin-bottom: 14px;
  }
  pre {
    margin: 0 0 12px;
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-dim);
    background: var(--bg-0);
    border: 1px solid var(--line);
    overflow-x: auto;
  }
  ul {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .links a {
    font-size: var(--step--1);
  }
  .fund {
    margin-top: 24px;
  }
  .small {
    font-size: var(--step--1);
    margin-top: 10px;
  }
  .lic li {
    color: var(--text-dim);
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }
  .bottom a {
    color: var(--text-dim);
    text-decoration: none;
  }
  @media (max-width: 960px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
