<script lang="ts">
  import { PHOTOS, fallbackExt, photoUrl, srcset } from '../data/photos';

  interface Props {
    id: string;
    /** sizes attribute; defaults to full width */
    sizes?: string;
    /** load immediately (above the fold) */
    eager?: boolean;
    /** cover the parent box (parent must be positioned and sized) */
    cover?: boolean;
    /** override focus / object-position */
    focus?: string;
    alt?: string;
    class?: string;
  }
  let { id, sizes = '100vw', eager = false, cover = false, focus, alt, class: cls = '' }: Props = $props();

  const p = $derived(PHOTOS[id]);
  const fallbackW = $derived(p.widths.includes(960) ? 960 : p.widths[p.widths.length - 1]);
  let loaded = $state(false);
</script>

<picture class="pic {cls}" class:cover style:background-image="url({p.placeholder})">
  <source type="image/avif" srcset={srcset(id, 'avif')} {sizes} />
  <source type="image/webp" srcset={srcset(id, 'webp')} {sizes} />
  <img
    src={photoUrl(id, fallbackW, fallbackExt(id))}
    srcset={srcset(id, fallbackExt(id))}
    {sizes}
    alt={alt ?? p.alt}
    width={p.width}
    height={p.height}
    loading={eager ? 'eager' : 'lazy'}
    fetchpriority={eager ? 'high' : 'auto'}
    decoding="async"
    style:object-position={focus ?? p.focus}
    class:loaded
    onload={() => (loaded = true)}
  />
</picture>

<style>
  .pic {
    display: block;
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }
  .pic img {
    width: 100%;
    height: auto;
    opacity: 0;
    transition: opacity 0.6s ease;
  }
  .pic img.loaded {
    opacity: 1;
  }
  .pic.cover {
    position: absolute;
    inset: 0;
  }
  .pic.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
