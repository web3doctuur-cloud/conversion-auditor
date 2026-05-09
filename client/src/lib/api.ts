import { AuditReport } from '../types/audit';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function runAudit(url: string): Promise<AuditReport> {
  const res = await fetch(`${BASE}/api/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<AuditReport>;
}
