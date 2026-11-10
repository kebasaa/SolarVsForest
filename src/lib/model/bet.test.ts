import { describe, expect, it } from 'vitest';
import { computeBet, type BetInputs } from './bet';
import { CO2F, EPA_KETURA, FUELS, LCA_CO2_STORAGE } from './constants';
import {
  FOREST_DRYLAND_HIGH,
  FOREST_DRYLAND_LOW,
  FOREST_TEMPERATE,
  FOREST_TROPICAL,
  FOREST_YATIR,
  PV_TEMPERATE,
  PV_TROPICAL,
  pvDrylands
} from './presets';
import { TABLE2, TABLE3 } from '../data/paper';

/**
 * A computed value "matches" a printed one if it rounds (or truncates) to it at the
 * printed precision: |x − printed| ≤ 0.6 · 10^−decimals.
 */
function expectPrinted(x: number, printed: number, decimals: number) {
  const tol = 0.6 * 10 ** -decimals;
  expect(Math.abs(x - printed), `computed ${x} vs printed ${printed}`).toBeLessThanOrEqual(tol);
}

describe('Table 2 — Ketura PV field, reproduced at preset defaults', () => {
  for (const fuel of FUELS) {
    const r = computeBet(pvDrylands(fuel));
    it(`${fuel}: CES, RFc and BET`, () => {
      expectPrinted(r.ces, TABLE2.ces[fuel], 1);
      expectPrinted(-r.rfc * 1e14, TABLE2.rfc[fuel], 2);
      expectPrinted(r.bet, TABLE2.bet[fuel], 1);
    });
    it(`${fuel}: carbon footprints (CF = CO2F × 0.27, CF−LCA from rounded CF)`, () => {
      const cf = CO2F[fuel] * 0.27;
      expectPrinted(cf, TABLE2.cf[fuel], 2);
      expectPrinted(Math.round(cf * 100) / 100 - TABLE2.lca, TABLE2.cfMinusLca[fuel], 2);
    });
    it(`${fuel}: RFr local and global`, () => {
      expectPrinted(r.rfrLocal, TABLE2.rfrLocal.pv, 2);
      expectPrinted(r.rfrGlobal * 1e13, TABLE2.rfrGlobal.pv, 2);
    });
  }

  it('EPa = 365 · 25,500 / 75,600 ≈ 123 kWh m⁻² yr⁻¹ (Eq. M5)', () => {
    expectPrinted(EPA_KETURA, TABLE2.EPa, 0);
  });

  it('LCA 0.095 kgCO₂ kWh⁻¹ ≈ 0.026 kgC kWh⁻¹', () => {
    expectPrinted(LCA_CO2_STORAGE * 12 / 44, TABLE2.lca, 3);
  });
});

describe('Table 2 — Yatir afforestation, reproduced at preset defaults', () => {
  const yatir = computeBet(FOREST_YATIR.inputs);
  const high = computeBet(FOREST_DRYLAND_HIGH.inputs);

  it('RFc (×10⁻¹⁴) = −4.12×10⁻²', () => {
    expectPrinted(-yatir.rfc * 1e14 * 100, TABLE2.rfc.forest * 100, 2);
  });
  it('RFr local 39.38 W m⁻², global 0.76×10⁻¹³ W m⁻²', () => {
    expectPrinted(yatir.rfrLocal, TABLE2.rfrLocal.forest, 2);
    expectPrinted(yatir.rfrGlobal * 1e13, TABLE2.rfrGlobal.forest, 2);
  });
  it('BET 94–185 years', () => {
    expectPrinted(high.bet, TABLE2.bet.forest[0], 0);
    expectPrinted(yatir.bet, TABLE2.bet.forest[1], 0);
  });
});

describe('Table 3 — climate zones, reproduced at preset defaults', () => {
  it('afforestation BET: temperate 18.5, tropical 15.4, drylands 94–175', () => {
    expectPrinted(computeBet(FOREST_TEMPERATE.inputs).bet, 18.5, 1);
    expectPrinted(computeBet(FOREST_TROPICAL.inputs).bet, 15.4, 1);
    expectPrinted(computeBet(FOREST_DRYLAND_HIGH.inputs).bet, 94, 0);
    expectPrinted(computeBet(FOREST_DRYLAND_LOW.inputs).bet, 175, 0);
  });

  it('afforestation required land: temperate 21.3, tropical 16.1, drylands 44 (upper)', () => {
    expectPrinted(computeBet(FOREST_TEMPERATE.inputs).landMkm2, 21.3, 1);
    expectPrinted(computeBet(FOREST_TROPICAL.inputs).landMkm2, 16.1, 1);
    expectPrinted(computeBet(FOREST_DRYLAND_LOW.inputs).landMkm2, 44, 0);
  });

  it('PV CES: temperate 12.1, tropical 15.8, drylands 14.9 (world mix)', () => {
    expectPrinted(computeBet(PV_TEMPERATE.inputs).ces, TABLE3.temperate.pv.ces, 1);
    expectPrinted(computeBet(PV_TROPICAL.inputs).ces, TABLE3.tropical.pv.ces, 1);
    expectPrinted(computeBet(pvDrylands('world')).ces, TABLE3.drylands.pv.ces, 1);
  });

  it('PV required land: temperate 0.55, tropical 0.42, drylands 0.44 Mkm²', () => {
    expectPrinted(computeBet(PV_TEMPERATE.inputs).landMkm2, TABLE3.temperate.pv.requiredMkm2, 2);
    expectPrinted(computeBet(PV_TROPICAL.inputs).landMkm2, TABLE3.tropical.pv.requiredMkm2, 2);
    expectPrinted(computeBet(pvDrylands('world')).landMkm2, TABLE3.drylands.pv.requiredMkm2, 2);
  });

  it('PV BET: < 1 year in temperate and tropical for every fuel, 1.4–3.6 in drylands', () => {
    for (const fuel of FUELS) {
      expect(computeBet({ ...PV_TEMPERATE.inputs, co2f: CO2F[fuel] }).bet).toBeLessThan(1);
      expect(computeBet({ ...PV_TROPICAL.inputs, co2f: CO2F[fuel] }).bet).toBeLessThan(1);
    }
    expectPrinted(computeBet(pvDrylands('coal')).bet, 1.4, 1);
    expectPrinted(computeBet(pvDrylands('gas')).bet, 3.6, 1);
  });

  it('PV land efficiency EPa / Eg: temperate 0.11, tropical 0.09, drylands 0.06', () => {
    expectPrinted(PV_TEMPERATE.inputs.EPa / TABLE3.temperate.pv.Eg_kWh, TABLE3.temperate.pv.landEff, 2);
    expectPrinted(PV_TROPICAL.inputs.EPa / TABLE3.tropical.pv.Eg_kWh, TABLE3.tropical.pv.landEff, 2);
    expectPrinted(EPA_KETURA / TABLE3.drylands.pv.Eg_kWh, TABLE3.drylands.pv.landEff, 2);
  });

  it('PV avoids ~100× more carbon per m² than the Yatir forest absorbs (14.9 vs 0.15)', () => {
    const ratio = computeBet(pvDrylands('world')).ces / FOREST_YATIR.inputs.sink;
    expect(ratio).toBeGreaterThan(95);
    expect(ratio).toBeLessThan(105);
  });
});

describe('Notebook outputs (test vectors from the published .ipynb files)', () => {
  const rel = (x: number, ref: number) => expect(Math.abs(x / ref - 1)).toBeLessThan(1e-6);

  it('Tab_2_BET_local', () => {
    rel(computeBet(pvDrylands('coal')).bet, 1.410258);
    rel(computeBet(pvDrylands('gas')).bet, 3.583443);
    rel(computeBet(pvDrylands('world')).bet, 2.456068);
    rel(computeBet(pvDrylands('oil')).bet, 1.900783);
    rel(computeBet(FOREST_YATIR.inputs).bet, 185.545656);
    rel(computeBet(pvDrylands('coal')).rfrGlobal, 1.008824e-13);
    rel(computeBet(pvDrylands('coal')).rfc, 7.153467e-14);
  });

  it('Tab_3_BET_global (absolute values; the notebook uses the opposite sign)', () => {
    // notebook inputs, i.e. EPa = 90 for temperate PV
    const temperatePvCode: BetInputs = { ...PV_TEMPERATE.inputs, EPa: 90 };
    rel(computeBet(FOREST_TEMPERATE.inputs).bet, 18.499038);
    rel(computeBet(FOREST_TROPICAL.inputs).bet, 15.396223);
    rel(computeBet({ ...temperatePvCode, co2f: CO2F.coal }).bet, 0.35171);
    rel(computeBet({ ...temperatePvCode, co2f: CO2F.gas }).bet, 0.89369);
    rel(computeBet({ ...temperatePvCode, co2f: CO2F.world }).bet, 0.612529);
    rel(computeBet({ ...PV_TROPICAL.inputs, co2f: CO2F.coal }).bet, 0.367574);
    rel(computeBet({ ...PV_TROPICAL.inputs, co2f: CO2F.gas }).bet, 0.933999);
    rel(computeBet({ ...PV_TROPICAL.inputs, co2f: CO2F.world }).bet, 0.640156);
  });
});
