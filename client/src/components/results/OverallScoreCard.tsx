import { useMemo } from 'react';

interface Props {
  score: number;
}

export default function OverallScoreCard({ score }: Props) {
  const color = useMemo(() => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  }, [score]);

  const strokeColor = useMemo(() => {
    if (score >= 90) return 'stroke-success';
    if (score >= 70) return 'stroke-warning';
    return 'stroke-danger';
  }, [score]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card flex flex-col items-center justify-center text-center">
      <h3 className="text-xl font-bold mb-6">Overall Score</h3>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-border"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`score-ring ${strokeColor}`}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ '--target-offset': strokeDashoffset } as React.CSSProperties}
          />
        </svg>
        <div className={`text-5xl font-black ${color} drop-shadow-md`}>
          {score}
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">
        Weighted average: Performance (30%), SEO (30%), Conversion (40%)
      </p>
    </div>
  );
}
