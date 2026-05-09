// Mirror of server/src/types/audit.ts
export type Rating = 'green' | 'yellow' | 'red';
export type CheckStatus = 'pass' | 'warning' | 'fail';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface MetricValue {
  value: number;
  unit: string;
  rating: Rating;
}

export interface PerformanceResult {
  score: number;
  ttfb: MetricValue;
  fcp: MetricValue;
  dcl: MetricValue;
  totalLoad: MetricValue;
}

export interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  value?: string | number | null;
  length?: number;
  recommendation: string | null;
}

export interface SeoResult {
  score: number;
  checks: SeoCheck[];
}

export interface ConversionCheck {
  id: string;
  label: string;
  status: CheckStatus;
  recommendation: string | null;
}

export interface ConversionResult {
  score: number;
  riskLevel: RiskLevel;
  checks: ConversionCheck[];
  tips: string[];
}

export interface ScreenshotAnnotation {
  type: 'missingAlt' | 'h1Missing' | 'ctaMissing';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenshotResult {
  base64: string;
  mimeType: 'image/png';
  annotations: ScreenshotAnnotation[];
}

export interface AuditReport {
  url: string;
  auditedAt: string;
  overallScore: number;
  performance: PerformanceResult;
  seo: SeoResult;
  conversion: ConversionResult;
  screenshot: ScreenshotResult;
  timedOut?: boolean;
}
