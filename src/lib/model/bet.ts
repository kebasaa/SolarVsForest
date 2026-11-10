/**
 * Break-even-time (BET) model, ported 1:1 from the published notebooks
 * (Tab_2_BET_local.ipynb / Tab_3_BET_global.ipynb), Eqs. M2–M6 of the paper.
 *
 *   CES   = EPa · (CO2F − LCA) · 12/44                 (Eq. M6)   [kgC m⁻² yr⁻¹]
 *   ΔC    = E · AF / k                                             [ppm]
 *   RFc   = [a₁ΔC² + b₁|ΔC| + c₁N̄ + 5.36] · ln(1 + ΔC/C₀)  (Eq. M4)   [W m⁻²]
 *   RFr   = (Δα · Eg − 0.1·RF_t) / A_E                  (Eq. M3)   [W m⁻²]
 *   n     = RFr / RFc                                   (Eq. M2)   [years]
 *
 * Sign convention used here: Δα = α_background − α_surface (positive = surface got darker),
 * RFr > 0 is warming and RFc is returned as a positive magnitude (it is a cooling, printed
 * with a minus sign in Table 2).
 *
 * The longwave term reproduces the notebook exactly: RF_t = 1.8 W m⁻² (≈10 % of the 18 W m⁻²
 * annual ΔLout of the forest) is multiplied by 0.1 once more, i.e. 0.18 W m⁻² enters RFr.
 * That is what produced the printed RFr (39.38 local, 0.76×10⁻¹³ global).
 */
import {
  A_EARTH,
  AIRBORNE_FRACTION,
  C0_PPM,
  C_PER_CO2,
  EMISSION_TARGET_GTC,
  ETMINAN,
  K_KGC_PER_PPM,
  LW_ESCAPE_FRACTION,
  N2O_PPB
} from './constants';

export interface BetInputs {
  /** 'pv' → carbon emission suppression from EPa; 'forest' → sequestration `sink` */
  kind: 'pv' | 'forest';
  /** Albedo change α_background − α_surface [–] */
  dAlbedo: number;
  /** Mean global (shortwave) radiation used for the albedo forcing [W m⁻²] */
  Eg: number;
  /** Longwave term RF_t as coded (forest: 1.8, PV: 0) [W m⁻²] */
  rfT: number;
  /** PV land efficiency; only enters the local RFr [–] */
  pvEff: number;
  /** Annual electricity production per m² of PV field [kWh m⁻² yr⁻¹] */
  EPa: number;
  /** CO₂ footprint of the replaced fossil electricity [kgCO₂ kWh⁻¹] */
  co2f: number;
  /** Life-cycle emissions of PV incl. storage [kgCO₂ kWh⁻¹] */
  lca: number;
  /** Forest carbon sink [kgC m⁻² yr⁻¹] */
  sink: number;
  /** Carbon airborne fraction [–] */
  af: number;
}

export interface BetResult {
  /** Carbon emission suppression (PV) or sequestration (forest) [kgC m⁻² yr⁻¹] */
  ces: number;
  /** Carbon footprint of replaced electricity minus PV LCA [kgC kWh⁻¹] */
  cfMinusLca: number;
  /** Change in atmospheric CO₂ per m² per year [ppm] */
  dC: number;
  /** Etminan scaling factor ν [W m⁻²] */
  nu: number;
  /** Radiative forcing of one year of carbon benefit, magnitude [W m⁻²] (printed as negative) */
  rfc: number;
  /** One-off albedo (+ longwave) forcing, global mean per m² converted [W m⁻²] */
  rfrGlobal: number;
  /** Local forcing at the surface [W m⁻²] */
  rfrLocal: number;
  /** Break-even time n [years] */
  bet: number;
  /** Land needed to offset EMISSION_TARGET_GTC per year [Mkm²] */
  landMkm2: number;
}

/** Carbon emission suppression of PV electricity, Eq. M6 [kgC m⁻² yr⁻¹] */
export function carbonEmissionSuppression(EPa: number, co2f: number, lca: number): number {
  return EPa * (co2f - lca) * C_PER_CO2;
}

/** ΔC in ppm for an annual carbon flux E [kgC m⁻² yr⁻¹] */
export function deltaCppm(E: number, af = AIRBORNE_FRACTION): number {
  return (E * af) / K_KGC_PER_PPM;
}

/** Etminan factor ν(ΔC) */
export function etminanNu(dC: number): number {
  return ETMINAN.a1 * dC * dC + ETMINAN.b1 * Math.abs(dC) + ETMINAN.c1 * N2O_PPB + ETMINAN.k;
}

/**
 * CO₂ radiative forcing of a concentration change ΔC (Eq. M4).
 * log1p avoids the catastrophic cancellation of ln((C₀+ΔC)/C₀) for ΔC ~ 1e-12 ppm
 * (the notebooks used 120-bit gmpy2 floats for the same reason).
 */
export function rfCarbon(dC: number): number {
  return etminanNu(dC) * Math.log1p(dC / C0_PPM);
}

export function computeBet(i: BetInputs): BetResult {
  const cfMinusLca = (i.co2f - i.lca) * C_PER_CO2;
  const ces = i.kind === 'pv' ? carbonEmissionSuppression(i.EPa, i.co2f, i.lca) : i.sink;
  const dC = deltaCppm(ces, i.af);
  const nu = etminanNu(dC);
  const rfc = rfCarbon(dC);
  const lw = LW_ESCAPE_FRACTION * i.rfT;
  const rfrGlobal = (i.dAlbedo * i.Eg - lw) / A_EARTH;
  const rfrLocal = (i.dAlbedo + (i.kind === 'pv' ? i.pvEff : 0)) * i.Eg + lw;
  const bet = rfrGlobal / rfc;
  const landMkm2 = (EMISSION_TARGET_GTC * 1e12) / ces / 1e12;
  return { ces, cfMinusLca, dC, nu, rfc, rfrGlobal, rfrLocal, bet, landMkm2 };
}

/**
 * Cumulative radiative forcing of n years of carbon benefit, n·RFc (Eq. M2),
 * used for the "race" chart. Linear in n, exactly as in the paper.
 */
export function cumulativeRfc(rfc: number, years: number): number {
  return rfc * years;
}
