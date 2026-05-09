import { Page } from 'playwright';
import { CheckStatus, SeoCheck, SeoResult } from '../types/audit';

function statusScore(s: CheckStatus): number {
  return s === 'pass' ? 100 : s === 'warning' ? 60 : 0;
}

export async function auditSeo(page: Page): Promise<SeoResult> {
  const d = await page.evaluate(() => {
    const title = document.title ?? '';
    const metaDescEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const metaDesc = metaDescEl?.content ?? '';
    const h1List = document.querySelectorAll('h1');
    const imgs = document.querySelectorAll('img');
    const canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const missingAlts = Array.from(imgs).filter((i) => !i.alt || i.alt.trim() === '').length;

    return {
      title,
      titleLen: title.length,
      metaDesc,
      metaLen: metaDesc.length,
      h1Count: h1List.length,
      imgCount: imgs.length,
      missingAlts,
      canonical: canonicalEl?.href ?? '',
    };
  });

  const checks: SeoCheck[] = [];

  // --- Title ---
  let titleStatus: CheckStatus = 'fail';
  let titleRec: string | null = 'Page is missing a title tag.';
  if (d.title && d.titleLen >= 30 && d.titleLen <= 60) {
    titleStatus = 'pass'; titleRec = null;
  } else if (d.title) {
    titleStatus = 'warning';
    titleRec = d.titleLen < 30
      ? `Title is too short (${d.titleLen} chars). Aim for 30–60 characters.`
      : `Title is too long (${d.titleLen} chars). Shorten to under 60 characters.`;
  }
  checks.push({ id: 'title', label: 'Title Tag', status: titleStatus, value: d.title, length: d.titleLen, recommendation: titleRec });

  // --- Meta Description ---
  let metaStatus: CheckStatus = 'fail';
  let metaRec: string | null = 'Add a meta description to improve search result CTR.';
  if (d.metaDesc && d.metaLen >= 120 && d.metaLen <= 160) {
    metaStatus = 'pass'; metaRec = null;
  } else if (d.metaDesc) {
    metaStatus = 'warning';
    metaRec = d.metaLen < 120
      ? `Meta description too short (${d.metaLen} chars). Aim for 120–160 characters.`
      : `Meta description too long (${d.metaLen} chars). Keep under 160 characters.`;
  }
  checks.push({ id: 'metaDescription', label: 'Meta Description', status: metaStatus, value: d.metaDesc, length: d.metaLen, recommendation: metaRec });

  // --- H1 ---
  let h1Status: CheckStatus;
  let h1Rec: string | null = null;
  if (d.h1Count === 1) { h1Status = 'pass'; }
  else if (d.h1Count === 0) { h1Status = 'fail'; h1Rec = 'No H1 tag found. Add one H1 to define the page topic.'; }
  else { h1Status = 'warning'; h1Rec = `${d.h1Count} H1 tags found. Use exactly one H1 per page.`; }
  checks.push({ id: 'h1Count', label: 'H1 Tag', status: h1Status, value: d.h1Count, recommendation: h1Rec });

  // --- Image Alts ---
  let altStatus: CheckStatus;
  let altRec: string | null = null;
  if (d.imgCount === 0 || d.missingAlts === 0) { altStatus = 'pass'; }
  else if (d.missingAlts <= 2) { altStatus = 'warning'; altRec = `${d.missingAlts} image(s) missing alt text.`; }
  else { altStatus = 'fail'; altRec = `${d.missingAlts} images missing alt text — hurts accessibility & SEO.`; }
  checks.push({ id: 'imgAlts', label: 'Image Alt Attributes', status: altStatus, value: d.missingAlts, recommendation: altRec });

  // --- Canonical ---
  const canonicalStatus: CheckStatus = d.canonical ? 'pass' : 'warning';
  checks.push({
    id: 'canonical', label: 'Canonical Link', status: canonicalStatus,
    value: d.canonical,
    recommendation: d.canonical ? null : 'Add a canonical link tag to prevent duplicate content issues.',
  });

  const score = Math.round(checks.reduce((s, c) => s + statusScore(c.status), 0) / checks.length);
  return { score, checks };
}
