import { Page } from 'playwright';
import { MetricValue, PerformanceResult, Rating } from '../types/audit';

function getRating(value: number, green: number, yellow: number): Rating {
  if (value <= green) return 'green';
  if (value <= yellow) return 'yellow';
  return 'red';
}

function ratingScore(r: Rating): number {
  return r === 'green' ? 100 : r === 'yellow' ? 60 : 20;
}

function metric(value: number, unit: string, green: number, yellow: number): MetricValue {
  const rating = getRating(value, green, yellow);
  return { value, unit, rating };
}

export async function measurePerformance(page: Page, url: string): Promise<PerformanceResult> {
  // Navigate and collect timing
  await page.goto(url, { waitUntil: 'load', timeout: 20000 });

  const timings = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');

    return {
      ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
      fcp: fcpEntry ? Math.round(fcpEntry.startTime) : 0,
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
      totalLoad: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
    };
  });

  const ttfb = metric(Math.max(0, timings.ttfb), 'ms', 200, 600);
  const fcp  = metric(Math.max(0, timings.fcp),  'ms', 1800, 3000);
  const dcl  = metric(Math.max(0, timings.dcl),  'ms', 2000, 4000);
  const totalLoad = metric(Math.max(0, timings.totalLoad), 'ms', 3000, 6000);

  const score = Math.round(
    ratingScore(ttfb.rating) * 0.25 +
    ratingScore(fcp.rating)  * 0.35 +
    ratingScore(dcl.rating)  * 0.20 +
    ratingScore(totalLoad.rating) * 0.20,
  );

  return { score, ttfb, fcp, dcl, totalLoad };
}
