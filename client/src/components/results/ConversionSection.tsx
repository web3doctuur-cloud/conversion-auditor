import { ConversionResult, ConversionCheck } from '../../types/audit';

interface Props {
  data: ConversionResult;
}

function CheckRow({ check }: { check: ConversionCheck }) {
  const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
  const color = check.status === 'pass' ? 'text-success' : check.status === 'warning' ? 'text-warning' : 'text-danger';

  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium text-text">{check.label}</span>
        </div>
        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${color} border-current opacity-80`}>
          {check.status}
        </span>
      </div>
      {check.recommendation && (
        <p className="text-sm text-muted mt-1 ml-7">{check.recommendation}</p>
      )}
    </div>
  );
}

export default function ConversionSection({ data }: Props) {
  const riskColor = data.riskLevel === 'low' ? 'text-success' : data.riskLevel === 'medium' ? 'text-warning' : 'text-danger';
  const riskBg = data.riskLevel === 'low' ? 'bg-success/20 text-success' : data.riskLevel === 'medium' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger';

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>🎯</span> Conversion Risk
        </h3>
        <div className="text-right">
          <span className="text-2xl font-black">{data.score}/100</span>
          <div className={`text-xs font-bold uppercase px-2 py-0.5 mt-1 rounded ${riskBg} inline-block`}>
            {data.riskLevel} Risk
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4">
        {data.checks.map((check) => (
          <CheckRow key={check.id} check={check} />
        ))}
      </div>

      {data.tips.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
            <span>💡</span> Key Recommendations
          </h4>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            {data.tips.map((tip, i) => (
              <li key={i} className="leading-snug">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
