# Reconciling the printed paper with the published code

The website's calculator ports the break-even-time (BET) model 1:1 from
`code/Tab_2_BET_local.ipynb` and `code/Tab_3_BET_global.ipynb`
([rafastern/Dryland_PV_vs_afforestation](https://github.com/rafastern/Dryland_PV_vs_afforestation)).
Requirement: **at its default settings, every scenario must reproduce the numbers printed in
the paper.** `src/lib/model/bet.test.ts` enforces this: a value matches when it rounds or
truncates to the printed number at the printed precision. The tests also check the
notebook's saved outputs to a relative error below 1e-6.

**Numerical precision.** ΔC is about 10⁻¹² ppm, so `ln(C/C₀)` evaluated naively in 64-bit floats
loses about 1 % of its value. The notebooks used 120-bit `gmpy2` floats for this reason. The JS
port evaluates the same quantity as `Math.log1p(ΔC/C₀)`, which is accurate to near machine
precision, and matches the notebooks' saved high-precision outputs to a relative error below
1e-6. The remaining differences below are 5–10 %. In this regime the model is effectively
linear in its inputs, so they cannot come from floating-point rounding. They reflect
different input values.

Most printed numbers come straight out of the notebook inputs. The cases below needed attention.

## A. Effective inputs (calibrated presets)

| # | Where | Printed / coded input | Effective input used | Why |
|---|-------|-----------------------|----------------------|-----|
| A1 | Table 3, temperate PV | EPa = 90 kWh m⁻² yr⁻¹ (code also 90) | **EPa = 99.6** | With EPa = 90 the model gives CES = 10.9 and 0.60 Mkm², but Table 3 prints CES **12.1** and **0.55** Mkm². Its land efficiency **0.11** also implies EPa ≈ 0.11 × 900 = 99. Only EPa between ≈ 99.3 and 99.8 reproduces all three, so the printed "90" looks like the outlier. |
| A2 | Table 3, dryland afforestation BET 94–175 | Δα = 0.16, RF_t = 1.8 (code, Table 2) | **Δα = 0.15, RF_t = 0** | Δα = 0.16 gives 185.5 yr at 0.15 kgC (Table 2 ✓) but 99.4 yr at 0.28 kgC. Table 3's **175** (at 0.15) and **94** (at 0.28) are reproduced exactly (174.75 and 93.62) with Δα = **0.15** and no longwave term. That is the Tab_3 notebook's convention (RF_t = 0 for every zone) and the forest albedo change of an earlier round of the analysis: an earlier conference presentation uses "Δ albedo = 0.15 ⇒ 36.75 W m⁻²", and its draft of Table 2 has forest Δα = 0.15. So the site has two dryland-forest presets: *Yatir (Table 2)*, Δα 0.16 + longwave → 185 yr, and *drylands (Table 3)*, Δα 0.15 → 175 / 94 yr. Table 2's range "94–185" combines the two. |

## B. Kept exactly as coded (they reproduce the printed values)

| # | Topic | Detail |
|---|-------|--------|
| B1 | Longwave term | The paper writes `RFr = (Δα·Eg + 0.1·ΔLout)/A_E` with ΔLout = 18 W m⁻². The code sets `RF_t = 1.8` and multiplies by 0.1 again, so it uses 0.18 W m⁻². It also *subtracts* that term in the global RFr and *adds* it in the local RFr. This is what yields the printed 39.38 W m⁻² (local) and 0.76×10⁻¹³ W m⁻² (global), so it is kept. The effect on BET is < 0.5 %. |
| B2 | PV efficiency in local RFr | Methods: PVeff "needs to be subtracted from Δα" locally. Tab_2 code: `−(Δα_code − PVeff)·Eg`, with Δα_code = −0.21, so it effectively *adds* it: (0.21 + 0.058) × 245 = **65.66** = printed. Kept, because only the local RFr depends on it, not BET. |
| B3 | Etminan b₁ sign | The paper prints b₁ = −7.2×10⁻⁴; the code (and Etminan et al. 2016) use +7.2×10⁻⁴. Irrelevant at ΔC ≈ 10⁻¹² ppm. The code's value is kept. |
| B4 | Eg for the albedo forcing | Table 3 lists Eg = 900 / 1,500 kWh m⁻² yr⁻¹ (≈ 103 / 171 W m⁻²) for the temperate and tropical PV sites. The BET was computed with **134 / 177 W m⁻²** (flux-site radiation, Tab_3). The calculator labels the two quantities separately. |
| B5 | Tropical PVeff | The Tab_3 notebook accidentally reuses PVeff = 0.11 (it sets lowercase `pve = 0.09`). Only the local RFr is affected, which Table 3 doesn't print. The site uses the printed 0.09. |
| B6 | CF − LCA (Table 2 row) | The printed 0.21 / 0.15 / 0.08 / 0.12 come from the *rounded* CF minus 0.026. The CES row uses unrounded values (26.0 / 19.3 / 10.2 / 14.9). The site shows the printed row and computes CES unrounded, as the code does. |
| B7 | Sign of Table 3 BETs | The Tab_3 notebook defines Δα = background − surface, so its saved BETs are negative. The site uses absolute values, as printed. |
| B8 | Albedo values in Fig. 1 vs Table 3 | Fig. 1 shows **summer-midday** albedo (0.20 PV, 0.37 desert, 0.12 forest, 0.27 desert). Table 3 and the BET use **annual** albedo (0.17, 0.38, 0.12, 0.28). The site labels each one. |

## C. Not reproducible from the model — needs a decision

| # | Where | Printed | Model | Note |
|---|-------|---------|-------|------|
| C1 | Required land, dryland afforestation, lower bound | **26** Mkm² | 6.6 GtC / 0.28 kgC m⁻² = **23.6** Mkm² | 26 implies a sink of ≈ 0.254 kgC m⁻² yr⁻¹, which contradicts the 0.28 used for BET = 94. Current handling: the land-area graphic shows the printed **26–44** from Table 3. The calculator's live "land needed" readout gives 23.6 for the 0.28 preset, with a footnote. |
