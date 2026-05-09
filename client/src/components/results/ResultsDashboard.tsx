import { AuditReport } from '../../types/audit';
import OverallScoreCard from './OverallScoreCard';
import PerformanceSection from './PerformanceSection';
import SeoSection from './SeoSection';
import ConversionSection from './ConversionSection';
import ScreenshotPanel from './ScreenshotPanel';

interface Props {
  data: AuditReport;
  onNewAudit: () => void;
}

export default function ResultsDashboard({ data, onNewAudit }: Props) {
  const date = new Date(data.auditedAt).toLocaleString();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in stagger">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-border/50 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Audit Results</h2>
          <p className="text-muted flex items-center gap-2 flex-wrap">
            <span>Target: <a href={data.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{data.url}</a></span>
            <span className="opacity-50">•</span>
            <span>{date}</span>
          </p>
        </div>
        <button 
          onClick={onNewAudit}
          className="px-5 py-2.5 rounded-lg border border-border hover:bg-surface hover:border-primary/50 transition-all font-medium text-sm flex items-center gap-2"
        >
          <span>🔄</span> New Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <OverallScoreCard score={data.overallScore} />
        </div>
        <div className="lg:col-span-2">
          <PerformanceSection data={data.performance} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 h-[500px]">
          <SeoSection data={data.seo} />
        </div>
        <div className="lg:col-span-1 h-[500px]">
          <ConversionSection data={data.conversion} />
        </div>
        <div className="lg:col-span-1 h-[500px]">
          <ScreenshotPanel data={data.screenshot} url={data.url} />
        </div>
      </div>
    </div>
  );
}
