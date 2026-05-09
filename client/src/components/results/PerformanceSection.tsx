import { PerformanceResult, MetricValue } from '../../types/audit';

interface Props {
  data: PerformanceResult;
}

function MetricCard({ title, metric, description }: { title: string; metric: MetricValue; description: string }) {
  const color = metric.rating === 'green' ? 'text-success' : metric.rating === 'yellow' ? 'text-warning' : 'text-danger';
  const bgColor = metric.rating === 'green' ? 'bg-success/10' : metric.rating === 'yellow' ? 'bg-warning/10' : 'bg-danger/10';

  return (
    <div className={`p-4 rounded-lg border border-border bg-surface ${bgColor} bg-opacity-20 flex flex-col justify-between`}>
      <h4 className="text-sm font-semibold text-muted mb-2">{title}</h4>
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {metric.value} <span className="text-sm font-normal opacity-70">{metric.unit}</span>
      </div>
      <p className="text-xs text-muted/80 leading-tight mt-auto">{description}</p>
    </div>
  );
}

export default function PerformanceSection({ data }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>⚡</span> Performance
        </h3>
        <span className="text-2xl font-black">{data.score}/100</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Time To First Byte" 
          metric={data.ttfb} 
          description="Server response time." 
        />
        <MetricCard 
          title="First Contentful Paint" 
          metric={data.fcp} 
          description="When first content appears." 
        />
        <MetricCard 
          title="DOM Content Loaded" 
          metric={data.dcl} 
          description="HTML parsed and loaded." 
        />
        <MetricCard 
          title="Total Load Time" 
          metric={data.totalLoad} 
          description="When all resources finish loading." 
        />
      </div>
    </div>
  );
}
