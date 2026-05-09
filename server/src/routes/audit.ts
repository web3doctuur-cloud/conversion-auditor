import { Router, Request, Response } from 'express';
import { createContext } from '../services/browserService';
import { measurePerformance } from '../services/performanceService';
import { auditSeo } from '../services/seoService';
import { auditConversion } from '../services/conversionService';
import { captureScreenshot } from '../services/screenshotService';
import { computeOverallScore } from '../utils/scoring';
import { AuditReport } from '../types/audit';

const router = Router();
const TIMEOUT_MS = parseInt(process.env.AUDIT_TIMEOUT_MS ?? '25000', 10);

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

router.post('/', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'url field is required.' });
    return;
  }
  if (!isValidUrl(url)) {
    res.status(400).json({ error: 'Invalid URL. Please include https:// and a valid domain.' });
    return;
  }

  const { page, context } = await createContext();
  let timedOut = false;

  const timeoutHandle = setTimeout(async () => {
    timedOut = true;
    await context.close().catch(() => {});
  }, TIMEOUT_MS);

  try {
    // Run performance (navigates to page) then parallel audits
    const performance = await measurePerformance(page, url);

    const [seo, conversion] = await Promise.all([
      auditSeo(page),
      auditConversion(page),
    ]);

    // Derive annotation inputs
    const missingAltCheck = seo.checks.find((c) => c.id === 'imgAlts');
    const h1Check = seo.checks.find((c) => c.id === 'h1Count');
    const ctaCheck = conversion.checks.find((c) => c.id === 'ctaAboveFold');

    const screenshot = await captureScreenshot(page, {
      missingAltCount: typeof missingAltCheck?.value === 'number' ? missingAltCheck.value : 0,
      h1Count: typeof h1Check?.value === 'number' ? h1Check.value : 1,
      ctaAboveFold: ctaCheck?.status === 'pass',
    });

    clearTimeout(timeoutHandle);

    const overallScore = computeOverallScore(performance, seo, conversion);

    const report: AuditReport = {
      url,
      auditedAt: new Date().toISOString(),
      overallScore,
      performance,
      seo,
      conversion,
      screenshot,
      timedOut,
    };

    res.json(report);
  } catch (err: unknown) {
    clearTimeout(timeoutHandle);
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Audit] Error:', message);

    if (timedOut) {
      res.status(504).json({ error: 'Audit timed out. The target site may be slow or blocking automation.' });
    } else if (message.includes('net::ERR') || message.includes('ERR_NAME_NOT_RESOLVED')) {
      res.status(422).json({ error: 'Could not reach the target URL. Please check the address and try again.' });
    } else {
      res.status(500).json({ error: `Audit failed: ${message}` });
    }
  } finally {
    await context.close().catch(() => {});
  }
});

export default router;
