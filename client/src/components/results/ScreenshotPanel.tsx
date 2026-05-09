import { useState } from 'react';
import { ScreenshotResult } from '../../types/audit';

interface Props {
  data: ScreenshotResult;
  url: string;
}

export default function ScreenshotPanel({ data, url }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const imgSrc = `data:${data.mimeType};base64,${data.base64}`;
  const filename = `audit-${new URL(url).hostname}-${new Date().toISOString().split('T')[0]}.png`;

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>📸</span> Visual Analysis
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded hover:bg-surface border border-transparent hover:border-border transition-colors text-muted hover:text-text"
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? '🔍-' : '🔍+'}
          </button>
          <a
            href={imgSrc}
            download={filename}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
          >
            <span>⬇️</span> Download
          </a>
        </div>
      </div>
      
      <div className={`flex-1 bg-bg/50 rounded overflow-auto border border-border/50 relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setIsZoomed(!isZoomed)}>
        <img 
          src={imgSrc} 
          alt={`Screenshot of ${url} with annotations`}
          className={`w-full h-auto origin-top transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100 object-contain max-h-[600px]'}`}
        />
        
        {data.annotations.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {data.annotations.some(a => a.type === 'missingAlt') && (
              <span className="bg-danger/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow">Missing Alt Text (Red)</span>
            )}
            {data.annotations.some(a => a.type === 'h1Missing') && (
              <span className="bg-primary/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow">H1 Issue (Blue)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
