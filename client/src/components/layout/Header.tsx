export default function Header() {
  return (
    <header className="w-full border-b border-border/50 backdrop-blur-sm bg-bg/70 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary">Conversion</span>
            <span className="text-text"> Auditor</span>
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <span className="hidden sm:inline">Performance · SEO · Conversion</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-all duration-200 text-xs font-medium"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
