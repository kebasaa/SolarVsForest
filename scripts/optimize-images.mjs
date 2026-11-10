#!/usr/bin/env node
/**
 * Generate the responsive web images from the masters in assets-src/.
 *
 *   npm run images                      # everything
 *   npm run images -- --only=hero-pv    # a subset
 *
 * Sources: `src` in scripts/photos.config.json is relative to assets-src/photos/ (metadata-free
 * masters at the largest size used, JPEG q90), or relative to the repository with a `repo:` prefix
 * (the paper's figure assets). `original` records the camera file each master was made from.
 * A different source folder can be passed as the first argument or via PHOTOS_DIR.
 *
 * For every photo this writes
 *   public/img/<id>-<width>.{avif,webp,jpg}
 * (or .png instead of .jpg for entries with "alpha": true; entries with "optional": true are skipped
 * when their source is missing) for widths 480/960/1600/2400 (capped by `maxWidth` and the source size), plus
 * src/lib/data/photos.json with dimensions, available widths and a tiny blurred placeholder.
 *
 * All metadata (EXIF, XMP, IPTC, GPS) is dropped: sharp only keeps metadata when
 * .withMetadata()/.keepMetadata() is called, which this script never does.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const srcDir =
  process.argv.slice(2).find((a) => !a.startsWith('--')) ??
  process.env.PHOTOS_DIR ??
  path.join(repo, 'assets-src', 'photos');
const outDir = path.join(repo, 'public', 'img');
const manifestPath = path.join(repo, 'src', 'lib', 'data', 'photos.json');
const config = JSON.parse(fs.readFileSync(path.join(here, 'photos.config.json'), 'utf8'));

const WIDTHS = [480, 960, 1600, 2400];
const QUALITY = { avif: 50, webp: 72, jpg: 75 };

fs.mkdirSync(outDir, { recursive: true });
const manifest = {};
let total = 0;

// --only id1,id2 regenerates a subset and keeps the other manifest entries
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;
if (only && fs.existsSync(manifestPath)) Object.assign(manifest, JSON.parse(fs.readFileSync(manifestPath, 'utf8')));

for (const p of config.photos) {
  if (only && !only.has(p.id)) continue;
  // 'repo:' sources live in this repository (e.g. the paper's CC BY figure), others in the originals folder
  const file = p.src.startsWith('repo:') ? path.join(repo, p.src.slice(5)) : path.join(srcDir, p.src);
  const q = { ...QUALITY, ...(p.quality ?? {}) };
  if (!fs.existsSync(file)) {
    if (p.optional) {
      console.log(`${p.id.padEnd(22)} skipped (optional source not present: ${p.src})`);
    } else {
      console.error(`missing: ${file}`);
      process.exitCode = 1;
    }
    continue;
  }
  // images with transparency get a PNG fallback instead of JPEG
  const fallback = p.alpha ? 'png' : 'jpg';
  // .rotate() applies the EXIF orientation before the metadata is discarded
  const base = sharp(file, { failOn: 'none' }).rotate();
  const meta = await base.clone().metadata();
  const swapped = (meta.orientation ?? 1) >= 5;
  const srcW = swapped ? meta.height : meta.width;
  const srcH = swapped ? meta.width : meta.height;
  const cap = Math.min(p.maxWidth ?? 1600, srcW);
  const widths = WIDTHS.filter((w) => w <= cap);
  // also emit the cap itself when it is well above the largest standard width (or below the smallest)
  if (!widths.includes(cap) && (widths.length === 0 || cap > widths[widths.length - 1] * 1.15)) widths.push(cap);

  for (const w of widths) {
    const resized = base.clone().resize({ width: w, withoutEnlargement: true });
    const jobs = [
      ['avif', resized.clone().avif({ quality: q.avif, effort: process.env.CI ? 4 : 6 })],
      ['webp', resized.clone().webp({ quality: q.webp, effort: 5 })],
      p.alpha
        ? ['png', resized.clone().png({ palette: true, quality: 90, effort: 10 })]
        : ['jpg', resized.clone().jpeg({ quality: q.jpg, mozjpeg: true, progressive: true })]
    ];
    for (const [ext, pipeline] of jobs) {
      const out = path.join(outDir, `${p.id}-${w}.${ext}`);
      const info = await pipeline.toFile(out);
      total += info.size;
    }
  }

  const lqip = await base.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[p.id] = {
    width: srcW,
    height: srcH,
    widths,
    fallback,
    focus: p.focus ?? '50% 50%',
    alt: p.alt,
    credit: p.credit,
    license: p.license ?? config.license,
    placeholder: `data:image/webp;base64,${lqip.toString('base64')}`
  };
  const sizes = widths.map((w) => {
    const s = fs.statSync(path.join(outDir, `${p.id}-${w}.avif`)).size;
    return `${w}:${Math.round(s / 1024)}k`;
  });
  console.log(`${p.id.padEnd(22)} ${srcW}x${srcH}  avif ${sizes.join(' ')}`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${Object.keys(manifest).length} photos, ${(total / 1024 / 1024).toFixed(1)} MB written to public/img`);
