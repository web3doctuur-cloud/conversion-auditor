import { Page } from 'playwright';
import { ConversionCheck, ConversionResult, RiskLevel } from '../types/audit';

const CTA_KEYWORDS = ['get started', 'sign up', 'buy now', 'start free', 'try', 'join', 'contact', 'book', 'request', 'get a demo', 'free trial', 'learn more'];
const TRUST_KEYWORDS = ['testimonial', 'review', 'guarantee', 'secure', 'ssl', 'trusted', 'verified', 'award', 'certified', 'rated', 'as seen on', 'money back'];

export async function auditConversion(page: Page): Promise<ConversionResult> {
  const data = await page.evaluate(
    ({ ctaKws, trustKws }: { ctaKws: string[]; trustKws: string[] }) => {
      const vh = window.innerHeight;

      // CTA above fold
      let ctaAboveFold = false;
      const clickables = document.querySelectorAll('button, a[href], [role="button"], input[type="submit"]');
      for (const el of Array.from(clickables)) {
        const text = (el.textContent ?? '').toLowerCase();
        if (ctaKws.some((kw) => text.includes(kw))) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= vh) {
            ctaAboveFold = true;
            break;
          }
        }
      }

      // Trust signals — scan visible text
      const bodyText = (document.body?.innerText ?? '').toLowerCase();
      const trustFound = trustKws.some((kw) => bodyText.includes(kw));

      // Font readability
      const bodyStyle = window.getComputedStyle(document.body);
      const fontSize = parseFloat(bodyStyle.fontSize) || 0;
      const lineHeightRaw = parseFloat(bodyStyle.lineHeight) || 0;
      const ratio = fontSize > 0 ? lineHeightRaw / fontSize : 0;
      const fontOk = fontSize >= 14 && (ratio === 0 || ratio >= 1.4);

      // Mobile viewport meta
      const hasViewport = !!document.querySelector('meta[name="viewport"]');

      return { ctaAboveFold, trustFound, fontOk, hasViewport, fontSize: Math.round(fontSize) };
    },
    { ctaKws: CTA_KEYWORDS, trustKws: TRUST_KEYWORDS },
  );

  const checks: ConversionCheck[] = [];
  const tips: string[] = [];
  let score = 100;

  const push = (id: string, label: string, ok: boolean, warnOnly: boolean, rec: string, deduction: number) => {
    if (ok) {
      checks.push({ id, label, status: 'pass', recommendation: null });
    } else {
      score -= deduction;
      checks.push({ id, label, status: warnOnly ? 'warning' : 'fail', recommendation: rec });
      tips.push(rec);
    }
  };

  push('ctaAboveFold', 'Primary CTA Above the Fold', data.ctaAboveFold, false,
    'Move your primary call-to-action above the fold to maximise click-through rates.', 25);

  push('trustSignals', 'Trust Signals Detected', data.trustFound, true,
    'Add social proof: testimonials, star ratings, security badges, or money-back guarantees.', 20);

  push('fontReadability', 'Typography Readability', data.fontOk, true,
    `Increase body font size to at least 16px with 1.5× line-height. (Detected: ${data.fontSize}px)`, 15);

  push('mobileViewport', 'Mobile Viewport Meta Tag', data.hasViewport, false,
    'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile responsiveness.', 40);

  score = Math.max(0, score);
  const riskLevel: RiskLevel = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high';

  return { score, riskLevel, checks, tips };
}
