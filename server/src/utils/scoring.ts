import { PerformanceResult, SeoResult, ConversionResult } from '../types/audit';

export function computeOverallScore(
  performance: PerformanceResult,
  seo: SeoResult,
  conversion: ConversionResult,
): number {
  // Approved weights: Performance 30%, SEO 30%, Conversion 40%
  const score = performance.score * 0.3 + seo.score * 0.3 + conversion.score * 0.4;
  return Math.round(Math.min(100, Math.max(0, score)));
}
