import { AuditReport } from '../../types/audit';
import OverallScoreCard from './OverallScoreCard';

interface Props {
  data1: AuditReport;
  data2: AuditReport;
  onNewAudit: () => void;
}

export default function ComparisonDashboard({ data1, data2, onNewAudit }: Props) {
  const diff = data1.overallScore - data2.overallScore;
  const winner = diff > 0 ? 1 : diff < 0 ? 2 : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in stagger">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-border/50 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Competitor Comparison</h2>
          <p className="text-muted flex items-center gap-2 flex-wrap">
            <span className="text-primary font-medium">{new URL(data1.url).hostname}</span>
            <span className="opacity-50">vs</span>
            <span className="text-warning font-medium">{new URL(data2.url).hostname}</span>
          </p>
        </div>
        <button 
          onClick={onNewAudit}
          className="px-5 py-2.5 rounded-lg border border-border hover:bg-surface hover:border-primary/50 transition-all font-medium text-sm flex items-center gap-2"
        >
          <span>🔄</span> New Audit
        </button>
      </div>

      {/* Winner Banner */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-center shadow-lg shadow-black/20">
        <h3 className="text-2xl font-bold mb-2">
          {winner === 1 ? `🏆 ${new URL(data1.url).hostname} Wins!` : winner === 2 ? `🏆 ${new URL(data2.url).hostname} Wins!` : '🤝 It\'s a Tie!'}
        </h3>
        <p className="text-muted">
          {winner === 1 
            ? `Site 1 outperforms Site 2 by ${diff} points overall.` 
            : winner === 2 
            ? `Site 2 outperforms Site 1 by ${Math.abs(diff)} points overall.` 
            : 'Both sites have the exact same overall conversion score.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Site 1 Column */}
        <div className={`space-y-6 p-6 rounded-xl border ${winner === 1 ? 'border-primary shadow-lg shadow-primary/20 bg-primary/5' : 'border-border bg-surface'}`}>
          <h3 className="text-xl font-bold text-center border-b border-border/50 pb-4 mb-6 truncate" title={data1.url}>
            {new URL(data1.url).hostname}
          </h3>
          <div className="flex justify-center mb-6">
            <OverallScoreCard score={data1.overallScore} />
          </div>
          <div className="space-y-4">
            <MetricRow label="Performance" score={data1.performance.score} opponentScore={data2.performance.score} />
            <MetricRow label="SEO Health" score={data1.seo.score} opponentScore={data2.seo.score} />
            <MetricRow label="Conversion Risk" score={data1.conversion.score} opponentScore={data2.conversion.score} />
          </div>
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3">Simulated Heatmap</h4>
            <div className="bg-bg/50 rounded overflow-hidden border border-border/50 cursor-pointer">
              <img src={`data:${data1.screenshot.mimeType};base64,${data1.screenshot.base64}`} alt="Site 1 Screenshot" className="w-full object-cover max-h-64" />
            </div>
          </div>
        </div>

        {/* Site 2 Column */}
        <div className={`space-y-6 p-6 rounded-xl border ${winner === 2 ? 'border-warning shadow-lg shadow-warning/20 bg-warning/5' : 'border-border bg-surface'}`}>
          <h3 className="text-xl font-bold text-center border-b border-border/50 pb-4 mb-6 truncate" title={data2.url}>
            {new URL(data2.url).hostname}
          </h3>
          <div className="flex justify-center mb-6">
            <OverallScoreCard score={data2.overallScore} />
          </div>
          <div className="space-y-4">
            <MetricRow label="Performance" score={data2.performance.score} opponentScore={data1.performance.score} />
            <MetricRow label="SEO Health" score={data2.seo.score} opponentScore={data1.seo.score} />
            <MetricRow label="Conversion Risk" score={data2.conversion.score} opponentScore={data1.conversion.score} />
          </div>
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3">Simulated Heatmap</h4>
            <div className="bg-bg/50 rounded overflow-hidden border border-border/50 cursor-pointer">
              <img src={`data:${data2.screenshot.mimeType};base64,${data2.screenshot.base64}`} alt="Site 2 Screenshot" className="w-full object-cover max-h-64" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, score, opponentScore }: { label: string; score: number; opponentScore: number }) {
  const isWinner = score > opponentScore;
  const isLoser = score < opponentScore;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-bg/50 border border-border/30">
      <span className="font-medium text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${isWinner ? 'text-success' : isLoser ? 'text-danger' : 'text-text'}`}>
          {score}
        </span>
        {isWinner && <span className="text-xs">🏆</span>}
      </div>
    </div>
  );
}
