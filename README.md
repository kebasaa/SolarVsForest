# Solar vs Forest

**Website: [kebasaa.github.io/SolarVsForest](https://kebasaa.github.io/SolarVsForest/)**

An interactive explainer for

> Stern R.\*, Muller J. D.\*, Rotenberg E., Amer M., Segev L., Yakir D. (2023).
> **Photovoltaic fields largely outperform afforestation efficiency in global climate change mitigation strategies.**
> *PNAS Nexus* 2(11), pgad352. https://doi.org/10.1093/pnasnexus/pgad352 (\* equal contribution)

In drylands, a PV field offsets the warming caused by its darker surface (lower albedo) in about **2.5 years**. An
afforestation takes **94–185 years**, more than 50× longer. The site walks through the field measurements (albedo,
surface energy balance) and the break-even-time model, and lets you change the model inputs.

## What's inside

| Section | Content |
|---|---|
| Question | The break-even idea, `n · RFc = RFr`, with a year slider |
| Sites | Ketura PV field and Yatir forest |
| Albedo | Drag-to-compare nadir images, annual and summer-midday albedo |
| Energy | HUD photo callouts, interactive Fig. 1, Table 1 |
| Break-even | Calculator (presets for every scenario in Tables 2 and 3) and a "race" chart |
| Zones | Table 3 explorer and land-area squares |
| Methods | Mobile eddy-covariance lab, campaigns, instruments, gallery |

Every number comes from the paper. The calculator is a port of the published notebooks
([rafastern/Dryland_PV_vs_afforestation](https://github.com/rafastern/Dryland_PV_vs_afforestation),
`Tab_2_BET_local.ipynb`, `Tab_3_BET_global.ipynb`). At its default settings it reproduces every value printed in
Tables 2 and 3, and `npm test` checks this. A few printed values needed effective inputs;
[docs/reconciliation.md](docs/reconciliation.md) documents each one.

## Development

Requires Node ≥ 20.

```bash
npm install
npm run images   # generate public/img from assets-src (≈3 min, needed once)
npm run dev      # http://localhost:5173/SolarVsForest/
npm test         # model reproduces Tables 2 and 3
npm run check    # svelte-check / TypeScript
npm run build    # static site in dist/
```

Stack: [Svelte 5](https://svelte.dev) + [Vite](https://vite.dev), [d3-scale/d3-shape](https://d3js.org) for charts,
[KaTeX](https://katex.org) for equations, self-hosted fonts (Michroma, Inter, JetBrains Mono) via Fontsource. There are
no external requests at runtime.

```
src/lib/model/      BET model (bet.ts), constants, presets, tests
src/lib/data/       numbers as printed in the paper; photos.json (generated)
src/lib/components/ HUD primitives, charts, Fig. 1, gallery
src/sections/       one Svelte component per page section
assets-src/         image masters (photos: metadata-free JPEG q90; adapted Fig. 1 artwork)
scripts/            optimize-images.mjs + photos.config.json (alt text, credits, crops)
```

### Images

`assets-src/photos/` holds metadata-free masters (EXIF/GPS stripped) at the largest size the site uses.
`npm run images` turns them into AVIF/WebP/JPEG (PNG for the transparent figure) at 480–2400 px, plus
`src/lib/data/photos.json` (sizes, alt text, credits, blurred placeholders). The generated `public/img/` is not
committed; CI builds it, with a cache.

To add a photo, put a master in `assets-src/photos/`, add an entry to `scripts/photos.config.json`, then run
`npm run images -- --only=<id>`.

## Deployment

`.github/workflows/deploy.yml` runs the tests, type check, image generation and build on every push and PR. On `main`
it deploys `dist/` to GitHub Pages. One-time setup: **Settings → Pages → Source: GitHub Actions**. The repository must
be public (or on a plan with private Pages).

## Licences

- **Code** (everything except the items below): [GNU GPL v3](LICENSE)
- **Photos** (`assets-src/photos/`, generated `public/img/` photos): © Jonathan D. Müller,
  [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
- **Paper, adapted Fig. 1 artwork** (`assets-src/fig1-art.png`), tables and
  quoted numbers: © The Author(s) 2023, published by Oxford University Press on behalf of the National Academy of
  Sciences, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Fonts: SIL Open Font License (Michroma, Inter, JetBrains Mono); KaTeX: MIT

## Citation

See [CITATION.cff](CITATION.cff). Please cite the paper when using the numbers or figures.
