/**
 * Scenario presets for the BET calculator.
 *
 * Every preset reproduces the numbers printed in the paper (Tables 2 and 3) at its default
 * settings; this is enforced by bet.test.ts. Where the published notebook inputs do not
 * reproduce a printed number, the preset carries an *effective* value and a `calibration`
 * note. See docs/reconciliation.md for the derivation of each one.
 */
import type { BetInputs } from './bet';
import {
  AIRBORNE_FRACTION,
  CO2F,
  EPA_KETURA,
  LCA_CO2_STORAGE,
  PVEFF_KETURA,
  type Fuel
} from './constants';

export type Zone = 'drylands' | 'temperate' | 'tropical';

export interface Calibration {
  /** Input field that differs from the value printed / coded */
  field: keyof BetInputs;
  /** Value printed in the paper (or used in the notebook) */
  printed: number;
  /** Short explanation shown in the UI tooltip */
  note: string;
}

export interface Preset {
  id: string;
  label: string;
  zone: Zone;
  inputs: BetInputs;
  calibration?: Calibration[];
}

const base = { af: AIRBORNE_FRACTION, lca: LCA_CO2_STORAGE, co2f: CO2F.world } as const;

/* ---------------------------------------------------------------- PV fields */

/** Ketura PV field (Table 2), replacing a given fossil fuel */
export function pvDrylands(fuel: Fuel): BetInputs {
  return {
    ...base,
    kind: 'pv',
    co2f: CO2F[fuel],
    dAlbedo: 0.21, // 0.38 desert − 0.17 PV field (annual)
    Eg: 245,
    rfT: 0,
    pvEff: PVEFF_KETURA,
    EPa: EPA_KETURA, // 123.115
    sink: 0
  };
}

export const PV_TEMPERATE: Preset = {
  id: 'pv-temperate',
  label: 'PV field · temperate (Germany)',
  zone: 'temperate',
  inputs: {
    ...base,
    kind: 'pv',
    dAlbedo: 0.07, // 0.20 grassland − 0.13 PV field
    Eg: 134, // W m⁻², flux-site radiation used in Tab_3 notebook
    rfT: 0,
    pvEff: 0.11,
    EPa: 99.6,
    sink: 0
  },
  calibration: [
    {
      field: 'EPa',
      printed: 90,
      note:
        'Table 3 lists EPa = 90 kWh m⁻² yr⁻¹, but its printed CES (12.1 kgC m⁻² yr⁻¹), land efficiency (0.11 × 900 kWh m⁻²) and required area (0.55 Mkm²) all imply EPa ≈ 99.6. The effective value is used so that every printed result is reproduced.'
    }
  ]
};

export const PV_TROPICAL: Preset = {
  id: 'pv-tropical',
  label: 'PV field · tropical (Panama)',
  zone: 'tropical',
  inputs: {
    ...base,
    kind: 'pv',
    dAlbedo: 0.08, // 0.18 grassland − 0.10 PV field
    Eg: 177,
    rfT: 0,
    pvEff: 0.09,
    EPa: 130,
    sink: 0
  }
};

/* ------------------------------------------------------------------ forests */

/** Yatir forest, Table 2 (Δα = 0.16, sink 0.15) → 185 years */
export const FOREST_YATIR: Preset = {
  id: 'forest-yatir',
  label: 'Afforestation · Yatir (Table 2)',
  zone: 'drylands',
  inputs: {
    ...base,
    kind: 'forest',
    dAlbedo: 0.16, // 0.28 desert − 0.12 forest (annual)
    Eg: 245,
    rfT: 1.8,
    pvEff: 0,
    EPa: 0,
    sink: 0.15 // Qubaja et al. 2020
  }
};

const DRYLAND_FOREST_TABLE3_NOTE =
  'Table 3 gives 94–175 years for dryland afforestation, Table 2 gives 185 years for Yatir (Δα = 0.16 with the longwave term). Table 3 is reproduced exactly with Δα = 0.15 and no longwave term (RF_t = 0, as for the other zones in the Table 3 notebook); Δα = 0.15 is the forest albedo change of an earlier version of the analysis.';

/** Dryland afforestation, Table 3, Yatir sink → 175 years */
export const FOREST_DRYLAND_LOW: Preset = {
  id: 'forest-dryland-low',
  label: 'Afforestation · drylands, Yatir sink (Table 3)',
  zone: 'drylands',
  inputs: { ...FOREST_YATIR.inputs, dAlbedo: 0.15, rfT: 0 },
  calibration: [{ field: 'dAlbedo', printed: 0.16, note: DRYLAND_FOREST_TABLE3_NOTE }]
};

/** Dryland afforestation, global dryland generalisation (Bastin et al. 2019) → 94 years */
export const FOREST_DRYLAND_HIGH: Preset = {
  id: 'forest-dryland-high',
  label: 'Afforestation · drylands, global sink (Table 3)',
  zone: 'drylands',
  inputs: { ...FOREST_YATIR.inputs, dAlbedo: 0.15, rfT: 0, sink: 0.28 },
  calibration: [{ field: 'dAlbedo', printed: 0.16, note: DRYLAND_FOREST_TABLE3_NOTE }]
};

export const FOREST_TEMPERATE: Preset = {
  id: 'forest-temperate',
  label: 'Afforestation · temperate',
  zone: 'temperate',
  inputs: {
    ...base,
    kind: 'forest',
    dAlbedo: 0.06, // 0.20 − 0.14
    Eg: 134,
    rfT: 0,
    pvEff: 0,
    EPa: 0,
    sink: 0.31 // Luyssaert et al. 2007
  }
};

export const FOREST_TROPICAL: Preset = {
  id: 'forest-tropical',
  label: 'Afforestation · tropical',
  zone: 'tropical',
  inputs: {
    ...base,
    kind: 'forest',
    dAlbedo: 0.05, // 0.18 − 0.13
    Eg: 177,
    rfT: 0,
    pvEff: 0,
    EPa: 0,
    sink: 0.41
  }
};

export const PV_DRYLANDS: Preset = {
  id: 'pv-drylands',
  label: 'PV field · Ketura (Table 2)',
  zone: 'drylands',
  inputs: pvDrylands('world')
};

export const ALL_PRESETS: Preset[] = [
  PV_DRYLANDS,
  PV_TEMPERATE,
  PV_TROPICAL,
  FOREST_YATIR,
  FOREST_DRYLAND_LOW,
  FOREST_DRYLAND_HIGH,
  FOREST_TEMPERATE,
  FOREST_TROPICAL
];
