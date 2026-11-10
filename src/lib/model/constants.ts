/**
 * Physical constants and parameters of the break-even-time (BET) model.
 *
 * Sources:
 *  - Stern, Muller et al. 2023, PNAS Nexus 2(11):pgad352, Materials and methods, Eqs. M2–M6
 *  - github.com/rafastern/Dryland_PV_vs_afforestation, code/Tab_2_BET_local.ipynb and
 *    code/Tab_3_BET_global.ipynb (the values below are the ones used in those notebooks)
 */

/** Surface area of planet Earth, A_E [m²] (Eq. M3) */
export const A_EARTH = 5.1e14;

/** Conversion kgC → ppm CO₂, k [kgC ppm⁻¹] (Nemet 2009) */
export const K_KGC_PER_PPM = 2.16e12;

/** Carbon airborne fraction, AF [–] (Friedlingstein et al. 2020) */
export const AIRBORNE_FRACTION = 0.46;

/** Background CO₂ concentration in 2019, C₀ [ppm] (NOAA/GML) */
export const C0_PPM = 409.85;

/** Background N₂O concentration in 2019, N̄ [ppb] (NOAA/GML) */
export const N2O_PPB = 331;

/**
 * Etminan et al. (2016) CO₂ forcing coefficients (Eq. M4).
 * The paper prints b₁ = −7.2×10⁻⁴; the code (and Etminan et al.) use +7.2×10⁻⁴.
 * At ΔC ≈ 10⁻¹² ppm the quadratic and linear terms are irrelevant either way.
 */
export const ETMINAN = {
  a1: -2.4e-7, // W m⁻² ppm⁻²
  b1: 7.2e-4, // W m⁻² ppm⁻¹
  c1: -2.1e-4, // W m⁻² ppb⁻¹
  k: 5.36 // W m⁻²
} as const;

/** Molar mass ratio C / CO₂ (12/44) used to turn kgCO₂ into kgC */
export const C_PER_CO2 = 0.272727273;

/** Fraction of the change in upwelling longwave radiation escaping directly to space (~10 %, Eq. M3) */
export const LW_ESCAPE_FRACTION = 0.1;

/** PV life-cycle emissions incl. Li-ion storage (da Silva Lima et al. 2021) [kgCO₂ kWh⁻¹] → 0.026 kgC kWh⁻¹ */
export const LCA_CO2_STORAGE = 0.095;

/** PV life-cycle emissions without storage (Meier & Kulcinski 2002) [kgCO₂ kWh⁻¹] — mentioned, not used */
export const LCA_CO2_NO_STORAGE = 0.039;

/** CO₂ footprint of fossil electricity, CO2F [kgCO₂ kWh⁻¹] (IEA 2019, year-2005 mix; Table 2) */
export const CO2F = {
  coal: 0.87,
  oil: 0.67,
  gas: 0.4,
  world: 0.54
} as const;
export type Fuel = keyof typeof CO2F;
export const FUELS: Fuel[] = ['coal', 'oil', 'gas', 'world'];
export const FUEL_LABEL: Record<Fuel, string> = {
  coal: 'Coal',
  oil: 'Oil',
  gas: 'Gas',
  world: 'World mix'
};

/** Ketura PV field (Eq. M5) */
export const KETURA = {
  dailyProduction_kWh: 25_500, // EPd, annual mean of daily production
  area_m2: 75_600, // A_pv
  capacity_MW: 4.9,
  irradiance_kWh_m2_yr: 2_122, // E_g (Vardimon 2011)
  meanSWin_W_m2: 245 // annual mean shortwave (Israel Meteorological Service)
} as const;

/** EPa = 365 · EPd / A_pv = 123.115 kWh m⁻² yr⁻¹ (Eq. M5) */
export const EPA_KETURA = (365 * KETURA.dailyProduction_kWh) / KETURA.area_m2;

/** Land-use efficiency of the Ketura PV field, PVeff = EPa / Eg ≈ 5.8 % (code uses 0.058) */
export const PVEFF_KETURA = 0.058;

/** Global electricity demand in 2050 (IRENA 2019) [TWh yr⁻¹] */
export const DEMAND_2050_TWH = 55_000;

/** Annual carbon emission of that demand with the world fossil mix, as stated in the paper [GtC yr⁻¹] */
export const EMISSION_TARGET_GTC = 6.6;

/** Expected main forest carbon-accumulation period (Braakhekke et al. 2019) [yr] */
export const FOREST_ACCUMULATION_YEARS = 80;
