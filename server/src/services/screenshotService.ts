import { Page } from 'playwright';
import sharp from 'sharp';
import { ScreenshotAnnotation, ScreenshotResult } from '../types/audit';

const MAX_HEIGHT = 8000;

interface AnnotationInput {
  missingAltCount: number;
  h1Count: number;
  ctaAboveFold: boolean;
}

export async function captureScreenshot(
  page: Page,
  input: AnnotationInput,
): Promise<ScreenshotResult> {
  // Scroll to top before capture
  await page.evaluate(() => window.scrollTo(0, 0));

  // Gather element positions for annotations
  const positions = await page.evaluate(
    ({ missingAltCount, h1Count }: { missingAltCount: number; h1Count: number }) => {
      const results: ScreenshotAnnotation[] = [];
      const scrollY = window.scrollY;

      // Missing alt images (up to 5)
      if (missingAltCount > 0) {
        const imgs = document.querySelectorAll<HTMLImageElement>('img:not([alt]), img[alt=""]');
        Array.from(imgs).slice(0, 5).forEach((img) => {
          const r = img.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            results.push({ type: 'missingAlt', x: Math.round(r.left), y: Math.round(r.top + scrollY), width: Math.round(r.width), height: Math.round(r.height) });
          }
        });
      }

      // H1 tag (if missing or multiple, mark the first or the body top)
      if (h1Count !== 1) {
        results.push({ type: 'h1Missing', x: 10, y: 10, width: 300, height: 50 });
      }

      return results;
    },
    { missingAltCount: input.missingAltCount, h1Count: input.h1Count },
  );

  // Take full-page screenshot
  const rawBuffer = await page.screenshot({ fullPage: true, type: 'png' });
  const meta = await sharp(rawBuffer).metadata();
  const imgWidth = meta.width ?? 1440;
  const imgHeight = Math.min(meta.height ?? 900, MAX_HEIGHT);

  // Crop if needed
  const croppedBuffer =
    (meta.height ?? 0) > MAX_HEIGHT
      ? await sharp(rawBuffer).extract({ left: 0, top: 0, width: imgWidth, height: imgHeight }).toBuffer()
      : rawBuffer;

  // Build annotation overlays
  const annotations: ScreenshotAnnotation[] = positions.filter((a) => a.y < imgHeight);
  const composites: sharp.OverlayOptions[] = annotations
    .filter((a) => a.width > 0 && a.height > 0)
    .map((a) => {
      const clampedHeight = Math.min(a.height, imgHeight - a.y);
      const color = a.type === 'missingAlt' ? 'ef4444' : '6366f1';
      const svg = `<svg width="${a.width}" height="${clampedHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${a.width}" height="${clampedHeight}" fill="#${color}" fill-opacity="0.25" stroke="#${color}" stroke-width="3" rx="3"/>
      </svg>`;
      return { input: Buffer.from(svg), top: Math.max(0, a.y), left: Math.max(0, a.x) };
    });

  // Add simulated F-pattern heatmap overlay
  const heatmapSvg = `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="heat1" cx="20%" cy="10%" r="40%" fx="20%" fy="10%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.5"/>
        <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="heat2" cx="15%" cy="30%" r="50%" fx="15%" fy="30%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.4"/>
        <stop offset="40%" stop-color="#f59e0b" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="heat3" cx="50%" cy="20%" r="40%" fx="50%" fy="20%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="70%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${imgWidth}" height="${imgHeight}" fill="url(#heat1)"/>
    <rect width="${imgWidth}" height="${imgHeight}" fill="url(#heat2)" style="mix-blend-mode: screen;"/>
    <rect width="${imgWidth}" height="${imgHeight}" fill="url(#heat3)" style="mix-blend-mode: screen;"/>
  </svg>`;

  composites.push({ input: Buffer.from(heatmapSvg), top: 0, left: 0 });

  const finalBuffer =
    composites.length > 0
      ? await sharp(croppedBuffer).composite(composites).png({ compressionLevel: 7 }).toBuffer()
      : croppedBuffer;

  return { base64: finalBuffer.toString('base64'), mimeType: 'image/png', annotations };
}
