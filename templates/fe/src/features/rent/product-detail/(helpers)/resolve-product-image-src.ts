/**
 * Turns a remote product image into a same-origin URL that html2canvas can
 * capture. Prefers the already-loaded carousel `<img>` (Next.js optimizer
 * `/_next/image?...`); otherwise builds that same-origin URL. Does not use
 * `/api/proxy-image`.
 */
export function resolveProductImageSrc(url: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }

  if (typeof document !== 'undefined') {
    const encoded = encodeURIComponent(url);
    const match = Array.from(document.images).find((img) => {
      const src = img.currentSrc || img.src || '';
      return src === url || src.includes(encoded);
    });
    if (match?.currentSrc || match?.src) return match.currentSrc || match.src;
  }

  return `/_next/image?url=${encodeURIComponent(url)}&w=384&q=75`;
}
