export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-24 py-10 text-center text-muted text-sm">
      <p>
        Built with{' '}
        <span className="text-danger">♥</span> using React, Node.js &amp; Playwright
      </p>
      <p className="mt-1 text-xs opacity-60">
        Audits are run in a real Chromium browser — no cached data.
      </p>
    </footer>
  );
}
