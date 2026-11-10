import manifest from './photos.json';

export interface PhotoInfo {
  width: number;
  height: number;
  widths: number[];
  /** fallback format for browsers without AVIF/WebP */
  fallback?: 'jpg' | 'png';
  focus: string;
  alt: string;
  credit: string;
  license: string;
  placeholder: string;
}

export const PHOTOS = manifest as Record<string, PhotoInfo>;
export type PhotoId = keyof typeof manifest;

export type Ext = 'avif' | 'webp' | 'jpg' | 'png';

export function fallbackExt(id: string): 'jpg' | 'png' {
  return PHOTOS[id].fallback ?? 'jpg';
}

export function photoUrl(id: string, w: number, ext: Ext) {
  return `${import.meta.env.BASE_URL}img/${id}-${w}.${ext}`;
}

export function srcset(id: string, ext: Ext) {
  return PHOTOS[id].widths.map((w) => `${photoUrl(id, w, ext)} ${w}w`).join(', ');
}
