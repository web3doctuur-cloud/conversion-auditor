import { useState, FormEvent } from 'react';

interface Props {
  onSubmit: (urls: string[]) => void;
  loading: boolean;
  error?: string;
}

export default function UrlInputForm({ onSubmit, loading, error }: Props) {
  const [url, setUrl] = useState('https://');
  const [competitorUrl, setCompetitorUrl] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed1 = url.trim();
    const trimmed2 = competitorUrl.trim();
    if (!trimmed1 || trimmed1 === 'https://') return;
    
    const urls = [trimmed1];
    if (trimmed2 && trimmed2 !== 'https://') {
      urls.push(trimmed2);
    }
    
    onSubmit(urls);
  }

  const isValid1 = (() => {
    try { new URL(url); return true; } catch { return false; }
  })();
  const isValid2 = (() => {
    if (!competitorUrl || competitorUrl === 'https://') return true; // Optional field
    try { new URL(competitorUrl); return true; } catch { return false; }
  })();

  const canSubmit = isValid1 && isValid2 && url !== 'https://';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            disabled={loading}
            className="w-full px-5 py-4 rounded-xl bg-surface border border-border text-text placeholder-muted
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                       transition-all duration-200 text-base disabled:opacity-50"
            aria-label="Website URL to audit"
            spellCheck={false}
            autoComplete="url"
          />
          {url.length > 8 && (
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium ${isValid1 ? 'text-success' : 'text-danger'}`}>
              {isValid1 ? '✓ valid' : '✗ invalid'}
            </span>
          )}
        </div>
        
        <div className="flex items-center text-muted font-medium sm:px-2">VS</div>

        <div className="flex-1 relative">
          <input
            id="competitor-input"
            type="text"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            placeholder="https://competitor.com (optional)"
            disabled={loading}
            className="w-full px-5 py-4 rounded-xl bg-surface border border-border text-text placeholder-muted
                       focus:outline-none focus:border-warning focus:ring-2 focus:ring-warning/20
                       transition-all duration-200 text-base disabled:opacity-50"
            aria-label="Competitor URL to compare"
            spellCheck={false}
            autoComplete="url"
          />
          {competitorUrl.length > 8 && (
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium ${isValid2 ? 'text-success' : 'text-danger'}`}>
              {isValid2 ? '✓ valid' : '✗ invalid'}
            </span>
          )}
        </div>

      </div>

      <div className="mt-4 flex justify-center">
        <button
          id="audit-submit-btn"
          type="submit"
          disabled={loading || !canSubmit}
          className="px-8 py-4 rounded-xl bg-primary hover:bg-indigo-500 text-white font-semibold
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5
                     whitespace-nowrap flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>{competitorUrl.length > 8 ? 'Run Comparison' : 'Run Audit'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-danger text-sm flex items-center gap-2 animate-slide-up">
          <span>⚠️</span> {error}
        </p>
      )}

      <p className="mt-3 text-muted text-xs text-center">
        Audit runs in a real browser — results typically take 10–25 seconds
      </p>
    </form>
  );
}
