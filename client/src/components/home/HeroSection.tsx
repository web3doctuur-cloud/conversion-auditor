import UrlInputForm from './UrlInputForm';

interface Props {
  onAudit: (urls: string[]) => void;
  loading: boolean;
  error?: string;
}

export default function HeroSection({ onAudit, loading, error }: Props) {
  return (
    <section className="flex flex-col items-center justify-center pt-24 pb-16 px-6 hero-bg text-center">
      <div className="animate-slide-up max-w-3xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Uncover the hidden <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">conversion leaks</span> in your website.
        </h1>
        <p className="text-lg text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Instantly audit your website’s performance, SEO health, and conversion risks with our free, real-browser analysis tool. Enter your URL below to get started.
        </p>
        
        <UrlInputForm onSubmit={onAudit} loading={loading} error={error} />
      </div>
      
      {loading && (
        <div className="mt-16 text-center animate-fade-in">
          <p className="text-primary font-medium mb-4">Warming up browser & running analysis...</p>
          <div className="flex justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary/40 animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.32s]"></div>
             <div className="w-2 h-2 rounded-full bg-primary/70 animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.16s]"></div>
             <div className="w-2 h-2 rounded-full bg-primary animate-[bounce_1.4s_infinite_ease-in-out_both]"></div>
          </div>
        </div>
      )}
    </section>
  );
}
