/**
 * Numbers as printed in Stern, Muller et al. (2023), PNAS Nexus 2(11):pgad352.
 * Kept verbatim (including their rounding) so the site can quote them and the tests
 * can check that the model reproduces them.
 */

export const PAPER = {
  title: 'Photovoltaic fields largely outperform afforestation efficiency in global climate change mitigation strategies',
  authors: ['Rafael Stern', 'Jonathan D. Muller', 'Eyal Rotenberg', 'Madi Amer', 'Lior Segev', 'Dan Yakir'],
  equalContribution: ['Rafael Stern', 'Jonathan D. Muller'],
  journal: 'PNAS Nexus',
  volume: 2,
  issue: 11,
  articleId: 'pgad352',
  year: 2023,
  published: '2023-11-21',
  doi: '10.1093/pnasnexus/pgad352',
  url: 'https://academic.oup.com/pnasnexus/article/2/11/pgad352/7429362',
  code: 'https://github.com/rafastern/Dryland_PV_vs_afforestation',
  data: 'https://doi.org/10.34933/403d99aa-17e2-4f67-95a4-5de13681439c',
  license: 'CC BY 4.0',
  affiliation: 'Weizmann Institute of Science, Rehovot, Israel'
} as const;

export const BIBTEX = `@article{stern2023photovoltaic,
  title   = {Photovoltaic fields largely outperform afforestation efficiency in global climate change mitigation strategies},
  author  = {Stern, Rafael and Muller, Jonathan D. and Rotenberg, Eyal and Amer, Madi and Segev, Lior and Yakir, Dan},
  journal = {PNAS Nexus},
  volume  = {2},
  number  = {11},
  pages   = {pgad352},
  year    = {2023},
  doi     = {10.1093/pnasnexus/pgad352}
}`;

/* ------------------------------------------------------------- Table 1 */

export type Surface = 'pv' | 'pvDesert' | 'forest' | 'forestDesert';

export interface Stat {
  mean: number;
  sd: number;
}

export interface Table1Row {
  Rn: Stat;
  H: Stat;
  LE: Stat;
  Lout: Stat;
  Ts: Stat;
  Ta: Stat;
  dTsa: Stat;
  rH: Stat;
}

/** Table 1 — summer midday (10:00–15:00) means and SD */
export const TABLE1: Record<Surface, Table1Row> = {
  pv: {
    Rn: { mean: 529, sd: 47 },
    H: { mean: 358, sd: 76 },
    LE: { mean: 35, sd: 28 },
    Lout: { mean: 583, sd: 16 },
    Ts: { mean: 49.5, sd: 2.2 },
    Ta: { mean: 35.7, sd: 2.6 },
    dTsa: { mean: 13.8, sd: 1.1 },
    rH: { mean: 44, sd: 12 }
  },
  pvDesert: {
    Rn: { mean: 410, sd: 35 },
    H: { mean: 199, sd: 50 },
    LE: { mean: 29, sd: 25 },
    Lout: { mean: 586, sd: 26 },
    Ts: { mean: 49.6, sd: 3.7 },
    Ta: { mean: 37.2, sd: 3.0 },
    dTsa: { mean: 12.4, sd: 1.2 },
    rH: { mean: 70, sd: 15 }
  },
  forest: {
    Rn: { mean: 650, sd: 89 },
    H: { mean: 522, sd: 97 },
    LE: { mean: 43, sd: 48 },
    Lout: { mean: 505, sd: 15 },
    Ts: { mean: 37.1, sd: 2.5 },
    Ta: { mean: 30.9, sd: 2.3 },
    dTsa: { mean: 6.3, sd: 1.0 },
    rH: { mean: 13, sd: 3 }
  },
  forestDesert: {
    Rn: { mean: 452, sd: 71 },
    H: { mean: 225, sd: 51 },
    LE: { mean: 33, sd: 42 },
    Lout: { mean: 550, sd: 17 },
    Ts: { mean: 43.9, sd: 2.5 },
    Ta: { mean: 29.3, sd: 1.9 },
    dTsa: { mean: 14.5, sd: 2.1 },
    rH: { mean: 74, sd: 25 }
  }
};

export const SURFACE_LABEL: Record<Surface, string> = {
  pv: 'PV field',
  pvDesert: 'Desert (PV background)',
  forest: 'Yatir forest',
  forestDesert: 'Desert (forest background)'
};

/** Fig. 1 — summer midday albedo shown in the schematic */
export const FIG1_ALBEDO: Record<Surface, number> = {
  pv: 0.2,
  pvDesert: 0.37,
  forest: 0.12,
  forestDesert: 0.27
};

/** Annual albedo (Results; Table 3, drylands) */
export const ANNUAL_ALBEDO = {
  pv: { mean: 0.17, sd: 0.04 },
  pvDesert: { mean: 0.38, sd: 0.02 },
  forest: { mean: 0.12, sd: null },
  forestDesert: { mean: 0.28, sd: 0.03 },
  panel: 0.05,
  dPv: { mean: 0.21, sd: 0.04 },
  dForest: { mean: 0.16, sd: 0.04 }
} as const;

/** Seasonal PV-desert albedo (Methods) */
export const DESERT_SEASONAL_ALBEDO = { spring: 0.4, summer: 0.37, autumn: 0.38 } as const;

/** Emissivities (Results / Methods S2) */
export const EMISSIVITY = { pv: 0.85, pvDesert: 0.87 } as const;

/* ------------------------------------------------------------- Table 2 */

export const TABLE2 = {
  co2f: { coal: 0.87, oil: 0.67, gas: 0.4, world: 0.54 },
  cf: { coal: 0.24, oil: 0.18, gas: 0.11, world: 0.15 },
  lca: 0.026,
  cfMinusLca: { coal: 0.21, oil: 0.15, gas: 0.08, world: 0.12 },
  ces: { coal: 26.0, oil: 19.3, gas: 10.2, world: 14.9 },
  forestSink: [0.15, 0.28] as const,
  /** ×10⁻¹⁴ W m⁻² (printed negative) */
  rfc: { coal: -7.15, oil: -5.31, gas: -2.81, world: -4.11, forest: -4.12e-2 },
  rfrLocal: { pv: 65.66, forest: 39.38 },
  /** ×10⁻¹³ W m⁻² */
  rfrGlobal: { pv: 1.01, forest: 0.76 },
  bet: { coal: 1.4, oil: 1.9, gas: 3.6, world: 2.5, forest: [94, 185] as const },
  EPa: 123
} as const;

/* ------------------------------------------------------------- Table 3 */

export type ZoneKey = 'temperate' | 'tropical' | 'drylands';
export const ZONES: ZoneKey[] = ['drylands', 'temperate', 'tropical'];
export const ZONE_LABEL: Record<ZoneKey, string> = {
  temperate: 'Temperate',
  tropical: 'Tropical',
  drylands: 'Drylands'
};

export interface Table3Zone {
  forest: {
    albedo: number;
    background: number;
    dAlbedo: number;
    sink: string;
    bet: string;
    availableMkm2: number;
    requiredMkm2: string;
  };
  pv: {
    albedo: number;
    background: number;
    dAlbedo: number;
    ces: number;
    bet: string;
    requiredMkm2: number;
    area_m2: number;
    Eg_kWh: number;
    EP_GWh: number;
    fpv: number;
    panelEff: number;
    landEff: number;
    EPa: number;
  };
  site: string;
}

export const TABLE3: Record<ZoneKey, Table3Zone> = {
  temperate: {
    site: 'Germany (DE-Gri, DE-Hzd)',
    forest: { albedo: 0.14, background: 0.2, dAlbedo: 0.06, sink: '0.31', bet: '18.5', availableMkm2: 2.1, requiredMkm2: '21.3' },
    pv: { albedo: 0.13, background: 0.2, dAlbedo: 0.07, ces: 12.1, bet: '<1', requiredMkm2: 0.55, area_m2: 110_000, Eg_kWh: 900, EP_GWh: 10, fpv: 0.45, panelEff: 0.15, landEff: 0.11, EPa: 90 }
  },
  tropical: {
    site: 'Panama (PA-SPn, PA-SPs)',
    forest: { albedo: 0.13, background: 0.18, dAlbedo: 0.05, sink: '0.41', bet: '15.4', availableMkm2: 4.7, requiredMkm2: '16.1' },
    pv: { albedo: 0.1, background: 0.18, dAlbedo: 0.08, ces: 15.8, bet: '<1', requiredMkm2: 0.42, area_m2: 130_000, Eg_kWh: 1500, EP_GWh: 17, fpv: 0.6, panelEff: 0.14, landEff: 0.09, EPa: 130 }
  },
  drylands: {
    site: 'Israel (Ketura PV, Yatir forest)',
    forest: { albedo: 0.12, background: 0.28, dAlbedo: 0.16, sink: '0.15–0.28', bet: '94–175', availableMkm2: 4, requiredMkm2: '26–44' },
    pv: { albedo: 0.17, background: 0.38, dAlbedo: 0.21, ces: 14.9, bet: '1.4–3.6', requiredMkm2: 0.44, area_m2: 75_600, Eg_kWh: 2122, EP_GWh: 9.3, fpv: 0.43, panelEff: 0.12, landEff: 0.06, EPa: 123 }
  }
};

/* ---------------------------------------------------- headline & context */

export const HEADLINE = {
  pvBet: 2.5,
  forestFactor: 50,
  carbonFactor: 100,
  mesicFactor: 20,
  hIncreasePv: 160,
  hIncreaseForest: 297,
  forestCooling: 7,
  albedoDropPct: 45
} as const;

export const LAND = {
  demand2050_TWh: 55_000,
  emission_GtC: 6.6,
  drylandAfforestationAvailable: 4,
  drylandForestRequired: [26, 44] as const,
  pvDrylandRequired: 0.44,
  pvShareOfDrylandsPct: 0.75,
  globalForestRestoration: 18,
  semiaridDrylands: 30,
  earthLand: 149,
  sweden: 0.45,
  africa: 30.4
} as const;

export const SITES = {
  ketura: {
    name: 'Ketura PV field',
    region: 'Arava valley, Israel',
    climate: 'Hyper-arid',
    rain_mm: 28,
    aridityIndex: '< 0.03',
    meanTemp: '23.9 ± 8 °C',
    area_m2: 75_600,
    capacity_MW: 4.9,
    tilt_deg: 30,
    panelCover: 0.43,
    rows: '51 % panels / 49 % soil (84 % of field), 16 % infrastructure',
    lat: 29.97, // approximate location of Kibbutz Ketura (for the locator map only)
    lon: 35.07
  },
  yatir: {
    name: 'Yatir forest',
    region: 'Northern Negev, Israel',
    climate: 'Semi-arid (dry Mediterranean)',
    area_ha: 2_800,
    species: 'Pinus halepensis',
    height_m: 10,
    canopyCover: 0.5,
    altitude: '600–850 m a.s.l.',
    tower: 'Eddy-covariance tower since 2001',
    lat: 31.347,
    lon: 35.052
  }
} as const;

export const CAMPAIGNS = [
  { season: 'Spring', year: 2018, desert: 'Mar 18–21', pv: 'Mar 22–27', desertAlbedo: 0.4 },
  { season: 'Autumn', year: 2018, desert: 'Oct 16–23', pv: 'Oct 24–31', desertAlbedo: 0.38 },
  { season: 'Summer', year: 2019, desert: 'Jul 09–15', pv: 'Jul 16–24', desertAlbedo: 0.37 }
] as const;
