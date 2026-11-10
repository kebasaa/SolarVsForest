import { CO2F, type Fuel } from './constants';
import type { BetInputs } from './bet';
import {
  FOREST_DRYLAND_HIGH,
  FOREST_DRYLAND_LOW,
  FOREST_TEMPERATE,
  FOREST_TROPICAL,
  FOREST_YATIR,
  PV_TEMPERATE,
  PV_TROPICAL,
  pvDrylands,
  type Calibration,
  type Zone
} from './presets';

export type Kind = 'pv' | 'forest';
export type ForestVariant = 'yatir' | 'drylandLow' | 'drylandHigh';

export interface ScenarioKey {
  kind: Kind;
  zone: Zone;
  fuel: Fuel;
  forest: ForestVariant;
}

export interface ResolvedScenario {
  label: string;
  source: string;
  inputs: BetInputs;
  calibration: Calibration[];
  /** printed BET to compare with, as text */
  printedBet: string;
}

export const FOREST_VARIANT_LABEL: Record<ForestVariant, string> = {
  yatir: 'Yatir · Table 2',
  drylandLow: 'Yatir sink · Table 3',
  drylandHigh: 'Global dryland sink · Table 3'
};

const PRINTED_PV_DRYLAND: Record<Fuel, string> = { coal: '1.4', oil: '1.9', gas: '3.6', world: '2.5' };

export function resolveScenario(k: ScenarioKey): ResolvedScenario {
  if (k.kind === 'pv') {
    if (k.zone === 'drylands') {
      return {
        label: 'PV field · Ketura, drylands',
        source: 'Table 2',
        inputs: pvDrylands(k.fuel),
        calibration: [],
        printedBet: PRINTED_PV_DRYLAND[k.fuel]
      };
    }
    const p = k.zone === 'temperate' ? PV_TEMPERATE : PV_TROPICAL;
    return {
      label: p.label,
      source: 'Table 3',
      inputs: { ...p.inputs, co2f: CO2F[k.fuel] },
      calibration: p.calibration ?? [],
      printedBet: '< 1'
    };
  }
  if (k.zone === 'drylands') {
    const p = k.forest === 'yatir' ? FOREST_YATIR : k.forest === 'drylandLow' ? FOREST_DRYLAND_LOW : FOREST_DRYLAND_HIGH;
    return {
      label: p.label,
      source: k.forest === 'yatir' ? 'Table 2' : 'Table 3',
      inputs: { ...p.inputs },
      calibration: p.calibration ?? [],
      printedBet: k.forest === 'yatir' ? '185' : k.forest === 'drylandLow' ? '175' : '94'
    };
  }
  const p = k.zone === 'temperate' ? FOREST_TEMPERATE : FOREST_TROPICAL;
  return {
    label: p.label,
    source: 'Table 3',
    inputs: { ...p.inputs },
    calibration: [],
    printedBet: k.zone === 'temperate' ? '18.5' : '15.4'
  };
}
