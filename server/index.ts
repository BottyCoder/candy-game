import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import logger from './utils/logger.js';
import { errorHandler } from './utils/errors.js';
import { initAdmin } from './utils/initAdmin.js';
import { startCleanupJob } from './utils/cleanup.js';

// Routes
import playersRouter from './routes/players.js';
import gamesRouter from './routes/games.js';
import leaderboardRouter from './routes/leaderboard.js';
import adminAuthRouter from './routes/admin/auth.js';
import adminDashboardRouter from './routes/admin/dashboard.js';
import adminExportRouter from './routes/admin/export.js';
import statsRouter from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats page: serve with no-index headers so crawlers and AI systems do not index it
const statsPath = env.NODE_ENV === 'production'
  ? path.join(__dirname, '../stats.html')
  : path.join(__dirname, '../public/stats.html');
app.get('/stats.html', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  res.sendFile(statsPath);
});

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// API routes
app.use('/api/players', playersRouter);
app.use('/api/games', gamesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', adminDashboardRouter);
app.use('/api/admin/export', adminExportRouter);
app.use('/api/stats', statsRouter);

// Serve static files in production
if (env.NODE_ENV === 'production') {
  // In production, compiled server runs from dist/server/, so go up one level to dist/
  const distPath = path.join(__dirname, '..');
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Initialize admin user and start cleanup job
async function startServer() {
  try {
    // Initialize admin user
    await initAdmin();

    // Start data retention cleanup job (60 days)
    startCleanupJob(60);

    // Start server
    const port = env.PORT;
    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📊 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 CORS enabled for: ${env.CORS_ORIGIN}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
