/** Number formatting helpers (en-GB style thousands with thin spaces avoided for clarity). */

export function fmt(x: number, decimals = 0): string {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/** Significant-figure formatting for wide-ranging outputs such as BET. */
export function fmtSig(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  const mag = Math.floor(Math.log10(Math.abs(x)));
  const decimals = Math.max(0, sig - 1 - mag);
  return fmt(x, Math.min(decimals, 6));
}

/** Split x into mantissa and power of ten, for "7.15 × 10⁻¹⁴" style display. */
export function sci(x: number, decimals = 2): { m: string; e: number } {
  if (!Number.isFinite(x) || x === 0) return { m: fmt(x, decimals), e: 0 };
  const e = Math.floor(Math.log10(Math.abs(x)));
  return { m: (x / 10 ** e).toFixed(decimals), e };
}

const SUP: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
};
export function sup(n: number): string {
  return String(n).split('').map((c) => SUP[c] ?? c).join('');
}
export function sciText(x: number, decimals = 2): string {
  const { m, e } = sci(x, decimals);
  return e === 0 ? m : `${m} × 10${sup(e)}`;
}

/** Percent position of a value on a range input, for the filled-track styling. */
export function pct(v: number, min: number, max: number): string {
  return `${(((v - min) / (max - min)) * 100).toFixed(2)}%`;
}
