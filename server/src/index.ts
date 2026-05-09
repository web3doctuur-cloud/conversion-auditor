import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getBrowser, closeBrowser } from './services/browserService';
import auditRouter from './routes/audit';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);
const origins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',');

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Increase request timeout to 35 s to accommodate long audits
app.use((req, res, next) => {
  res.setTimeout(35_000, () => {
    res.status(408).json({ error: 'Request timeout.' });
  });
  next();
});

app.use('/api/audit', auditRouter);

app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

// Warm up Playwright browser on start
getBrowser()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Server] Failed to launch browser:', err);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  console.log('[Server] Shutting down…');
  await closeBrowser();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
