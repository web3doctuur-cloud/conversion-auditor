import { SeoResult, SeoCheck } from '../../types/audit';

interface Props {
  data: SeoResult;
}

function CheckRow({ check }: { check: SeoCheck }) {
  const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
  const color = check.status === 'pass' ? 'text-success' : check.status === 'warning' ? 'text-warning' : 'text-danger';

  return (
    <div className="py-4 border-b border-border/30 last:border-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{icon}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium text-text">{check.label}</span>
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${color} border-current opacity-80`}>
              {check.status}
            </span>
          </div>
          
          {check.value !== undefined && (
            <p className="text-sm text-muted mb-2 bg-bg/50 p-2 rounded truncate max-w-[500px]">
              <span className="opacity-50 select-none">Found: </span>
              {check.value === '' ? <span className="italic opacity-50">Empty</span> : String(check.value)}
              {check.length !== undefined && <span className="opacity-50 ml-2">({check.length} chars)</span>}
            </p>
          )}

          {check.recommendation && (
            <p className="text-sm text-primary/90 flex items-center gap-1.5 mt-2">
              <span className="opacity-70">💡</span> {check.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeoSection({ data }: Props) {
  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>🔍</span> SEO Health
        </h3>
        <span className="text-2xl font-black">{data.score}/100</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        {data.checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}
