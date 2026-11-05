/**
 * Готова webp-копія картинки замість стискання «на льоту» (див.
 * scripts/prepare-images.mjs — там пояснено, чому так).
 *
 * fastImage(src, ширинаПоказу) → { src, unoptimized }:
 * - копія є → адреса статичного файлу і unoptimized: true (next/image
 *   віддає його як є, без /_next/image);
 * - копії немає (нову картинку залили в CMS після збірки) → вихідна адреса
 *   і unoptimized: false, тобто працює як раніше.
 *
 * ширинаПоказу — найбільша ширина в CSS-пікселях, у якій кадр стоїть на
 * сторінці. Беремо найменшу копію, що покриває її з запасом на ретину (×2).
 */
import manifest from './img-manifest.json';

type Entry = { width: number; height: number; files: Record<string, string> };
const map = manifest as Record<string, Entry>;

export function fastImage(src: string, displayWidth: number): { src: string; unoptimized: boolean } {
  const entry = map[src];
  if (!entry) return { src, unoptimized: false };
  const widths = Object.keys(entry.files)
    .map(Number)
    .sort((a, b) => a - b);
  const need = displayWidth * 2;
  const w = widths.find((x) => x >= need) ?? widths[widths.length - 1];
  return { src: entry.files[w], unoptimized: true };
}
